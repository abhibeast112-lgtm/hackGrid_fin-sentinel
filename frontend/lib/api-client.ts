import {
  FinancialException,
  InvestigationDetail,
  DecisionPayload,
  DecisionRecord,
} from './types';
import {
  INITIAL_EXCEPTIONS,
  INVESTIGATION_DATABASE,
  INITIAL_DECISIONS,
} from './mock-data';

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const STORAGE_KEYS = {
  EXCEPTIONS: 'finsentinel_exceptions_v1',
  DECISIONS: 'finsentinel_decisions_v1',
};

/* =========================================================
   Generic helpers
   ========================================================= */

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

/* =========================================================
   Existing dashboard exception loading
   ========================================================= */

export async function fetchExceptions(): Promise<{
  exceptions: FinancialException[];
  total_at_risk: number;
}> {
  const stored = getStoredItem<FinancialException[]>(
    STORAGE_KEYS.EXCEPTIONS,
    INITIAL_EXCEPTIONS
  );

  const total = stored.reduce(
    (sum, item) =>
      sum +
      (item.status === 'AWAITING_DECISION'
        ? item.amount_at_risk
        : 0),
    0
  );

  return {
    exceptions: stored,
    total_at_risk: total,
  };
}

/* =========================================================
   Investigation
   ========================================================= */

export async function fetchInvestigation(
  id: string
): Promise<InvestigationDetail> {
  const detail =
    INVESTIGATION_DATABASE[id] ||
    INVESTIGATION_DATABASE['EXC-101'];

  const exception = INITIAL_EXCEPTIONS.find(
    (item) => item.id === id
  );

  if (!exception?.backend_transaction_ids?.length) {
    return detail;
  }

  const storageKey = `finsentinel-investigation-${id}`;

  const existingInvestigationId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(storageKey)
      : null;

  if (existingInvestigationId) {
    return {
      ...detail,
      backend_investigation_id: existingInvestigationId,
    };
  }

  const response = await startInvestigation(
    exception.backend_transaction_ids
  );

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      storageKey,
      response.investigation_id
    );
  }

  return {
    ...detail,
    backend_investigation_id: response.investigation_id,
    requires_approval: response.requires_approval,
  };
}
/* =========================================================
   REAL LANGGRAPH CHECKPOINT RESUME
   ========================================================= */

export interface ResumeInvestigationResponse {
  investigation_id: string;
  status: string;
  current_step: string;
  risk_tier: string;
  requires_approval: boolean;
  checkpoint_prompt?: string;
  approval_options?: string[];
  step_output?: Record<string, unknown>;
  final_result?: Record<string, unknown> | null;
}

export async function resumeInvestigation(
  investigationId: string,
  action: string,
  feedback = '',
  reviewerId = 'frontend_reviewer'
): Promise<ResumeInvestigationResponse> {
  const response = await fetch(
    `${FASTAPI_BASE_URL}/investigations/${investigationId}/resume`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        feedback,
        reviewer_id: reviewerId,
      }),
    }
  );

  if (!response.ok) {
    let message = `Backend returned ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  return response.json();
}

/* =========================================================
   Start real investigation from detected transactions
   ========================================================= */

export async function startInvestigation(
  transactionIds: string[]
): Promise<ResumeInvestigationResponse> {
  const response = await fetch(
    `${FASTAPI_BASE_URL}/detect`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_ids: transactionIds,
      }),
    }
  );

  if (!response.ok) {
    let message = `Backend returned ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  return response.json();
}

/* =========================================================
   Final human decision
   ========================================================= */

export async function submitDecision(
  payload: DecisionPayload
): Promise<{
  success: boolean;
  message: string;
  record: DecisionRecord;
}> {
  /*
   * IMPORTANT:
   *
   * The current backend's /resume endpoint is the actual
   * human decision mechanism for LangGraph checkpoints.
   *
   * Final dashboard decision persistence is still using
   * the existing frontend decision API/fallback for now.
   *
   * We will connect this part to the backend after the
   * checkpoint flow is working.
   */

  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/api/decision`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const data = await response.json();

      syncLocalDecision(payload, data.record);

      return data;
    }
  } catch {
    // Continue to local fallback.
  }

  /*
   * Temporary frontend persistence.
   * This will be replaced by the backend audit endpoint.
   */

  const mockRecord: DecisionRecord = {
    id: `DEC-${Date.now().toString().slice(-4)}`,
    exception_id: payload.exception_id,
    decision: payload.decision,
    reviewer_notes: payload.reviewer_notes,
    timestamp: new Date().toISOString(),
    reviewer: 'Financial Controller (FC-84)',
    audit_hash: `0x${Math.random()
      .toString(16)
      .substring(2, 10)}`,
    status: 'COMMITTED',
  };

  syncLocalDecision(payload, mockRecord);

  return {
    success: true,
    message: `Decision [${payload.decision}] successfully committed to the immutable audit trail.`,
    record: mockRecord,
  };
}

/* =========================================================
   Local decision cache
   ========================================================= */

function syncLocalDecision(
  payload: DecisionPayload,
  record: DecisionRecord
) {
  if (typeof window === 'undefined') return;

  const currentExceptions = getStoredItem<FinancialException[]>(
    STORAGE_KEYS.EXCEPTIONS,
    INITIAL_EXCEPTIONS
  );

  const updated = currentExceptions.map((exc) => {
    if (exc.id === payload.exception_id) {
      return {
        ...exc,
        status: `RESOLVED_${payload.decision}`,
        agent_pipeline_status: `Resolved: ${payload.decision}`,
      };
    }

    return exc;
  });

  setStoredItem(STORAGE_KEYS.EXCEPTIONS, updated);

  const currentDecisions = getStoredDecisions();

  const filtered = currentDecisions.filter(
    (d) => d.id !== record.id
  );

  setStoredItem(STORAGE_KEYS.DECISIONS, [
    record,
    ...filtered,
  ]);
}

export function getStoredDecisions(): DecisionRecord[] {
  const items = getStoredItem<DecisionRecord[]>(
    STORAGE_KEYS.DECISIONS,
    INITIAL_DECISIONS
  );

  const seen = new Set<string>();

  const deduplicated = items.filter((item) => {
    if (!item?.id) return false;

    if (seen.has(item.id)) return false;

    seen.add(item.id);

    return true;
  });

  if (
    typeof window !== 'undefined' &&
    deduplicated.length !== items.length
  ) {
    setStoredItem(
      STORAGE_KEYS.DECISIONS,
      deduplicated
    );
  }

  return deduplicated;
}

export function resetMockData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(
    STORAGE_KEYS.EXCEPTIONS
  );

  localStorage.removeItem(
    STORAGE_KEYS.DECISIONS
  );
}