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

function getStoredItem<T>(
  key: string,
  fallback: T
): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const item = localStorage.getItem(key);

    return item
      ? JSON.parse(item)
      : fallback;

  } catch {
    return fallback;
  }
}


function setStoredItem<T>(
  key: string,
  value: T
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  } catch (e) {
    console.error(
      'Failed to save to localStorage',
      e
    );
  }
}


/* =========================================================
   Existing dashboard exception loading
   ========================================================= */

export async function fetchExceptions(): Promise<{
  exceptions: FinancialException[];
  total_at_risk: number;
}> {

  const stored =
    getStoredItem<FinancialException[]>(
      STORAGE_KEYS.EXCEPTIONS,
      INITIAL_EXCEPTIONS
    );


  const total =
    stored.reduce(
      (sum, item) =>
        sum +
        (
          item.status === 'AWAITING_DECISION'
            ? item.amount_at_risk
            : 0
        ),
      0
    );


  return {
    exceptions: stored,
    total_at_risk: total,
  };
}
export interface DetectedAnomaly {
  anomaly_id: string;
  anomaly_type: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  risk_score: number;
  risk_tier: string;
  vendor_id: string;
  vendor_name: string;
  invoice_number?: string | null;
  flagged_record_ids: string[];
  associated_records: Record<string, unknown>[];
}



function anomalyToException(
  anomaly: DetectedAnomaly
): FinancialException {
  const formattedAmount =
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: anomaly.currency,
      maximumFractionDigits: 0,
    }).format(anomaly.amount);

  return {
    id: `EXC-${anomaly.anomaly_id.replace(/^ANO-/, '')}`,
    backend_transaction_ids:
      anomaly.flagged_record_ids,
    risk_level:
      anomaly.risk_tier === 'HIGH'
        ? 'High Risk'
        : 'Med Risk',
    risk_score: anomaly.risk_score,
    exception_type: anomaly.title,
    vendor: anomaly.vendor_name,
    vendor_code: anomaly.vendor_id,
    invoice_no:
      anomaly.invoice_number || '',
    amount_at_risk: anomaly.amount,
    currency: anomaly.currency,
    formatted_amount: formattedAmount,
    agent_pipeline_status:
      'Detection Complete',
    created_at:
      new Date().toISOString(),
    summary: anomaly.description,
    status: 'AWAITING_DECISION',
    requires_approval:
      anomaly.risk_tier === 'HIGH',
    current_step: 1,
  };
}


/* =========================================================
   CSV IMPORT
   ========================================================= */

export interface CsvImportResponse {
  success: boolean;
  filename: string;
  rows_read: number;
  inserted: number;
  skipped: number;
  message: string;
  anomalies: DetectedAnomaly[];
}


export async function importTransactionsCsv(
  file: File
): Promise<CsvImportResponse> {

  const formData = new FormData();

  formData.append(
    'file',
    file
  );


  const response = await fetch(
    `${FASTAPI_BASE_URL}/import-csv`,
    {
      method: 'POST',
      body: formData,
    }
  );


  if (!response.ok) {

    let message =
      `CSV import failed with status ${response.status}`;


    try {

      const errorData =
        await response.json();


      if (errorData?.detail) {
        message = errorData.detail;
      }

    } catch {
      // Keep default error message.
    }


    throw new Error(message);
  }


  const result =
    (await response.json()) as CsvImportResponse;

  const detectedExceptions =
    result.anomalies.map(anomalyToException);

  if (typeof window !== 'undefined') {
    setStoredItem(
      STORAGE_KEYS.EXCEPTIONS,
      detectedExceptions
    );
  }

  return result;
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


  const storedExceptions =
    getStoredItem<FinancialException[]>(
      STORAGE_KEYS.EXCEPTIONS,
      INITIAL_EXCEPTIONS
    );

  const exception =
    storedExceptions.find(
      (item) => item.id === id
    );


  if (
    !exception?.backend_transaction_ids?.length
  ) {
    return detail;
  }


  const storageKey =
    `finsentinel-investigation-${id}`;


  const existingInvestigationId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(
          storageKey
        )
      : null;


  if (existingInvestigationId) {

    return {
      ...detail,
      backend_investigation_id:
        existingInvestigationId,
    };
  }


  const response =
    await startInvestigation(
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
    backend_investigation_id:
      response.investigation_id,

    requires_approval:
      response.requires_approval,
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

  const response =
    await fetch(
      `${FASTAPI_BASE_URL}/investigations/${investigationId}/resume`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          action,
          feedback,
          reviewer_id:
            reviewerId,
        }),
      }
    );


  if (!response.ok) {

    let message =
      `Backend returned ${response.status}`;


    try {

      const errorData =
        await response.json();


      if (errorData?.detail) {
        message =
          errorData.detail;
      }

    } catch {
      // Keep default error message.
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

  const response =
    await fetch(
      `${FASTAPI_BASE_URL}/detect`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          transaction_ids:
            transactionIds,
        }),
      }
    );


  if (!response.ok) {

    let message =
      `Backend returned ${response.status}`;


    try {

      const errorData =
        await response.json();


      if (errorData?.detail) {
        message =
          errorData.detail;
      }

    } catch {
      // Keep default error message.
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
   * /api/decision is a Next.js API route.
   * Therefore it must use a relative URL.
   */

  const response =
    await fetch(
      '/api/decision',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(payload),
      }
    );


  if (!response.ok) {

    let message =
      `Decision API returned ${response.status}`;


    try {

      const errorData =
        await response.json();


      if (errorData?.error) {

        message =
          errorData.error;

      } else if (errorData?.detail) {

        message =
          errorData.detail;
      }

    } catch {
      // Keep default error message.
    }


    throw new Error(message);
  }


  const data =
    await response.json();


  if (
    !data?.success ||
    !data?.record
  ) {

    throw new Error(
      data?.message ||
      'Decision API returned an invalid response.'
    );
  }


  syncLocalDecision(
    payload,
    data.record
  );


  return data;
}


/* =========================================================
   Local decision cache
   ========================================================= */

function syncLocalDecision(
  payload: DecisionPayload,
  record: DecisionRecord
) {

  if (
    typeof window === 'undefined'
  ) {
    return;
  }


  const currentExceptions =
    getStoredItem<FinancialException[]>(
      STORAGE_KEYS.EXCEPTIONS,
      INITIAL_EXCEPTIONS
    );


  const updated =
    currentExceptions.map(
      (exc) => {

        if (
          exc.id ===
          payload.exception_id
        ) {

          return {
            ...exc,

            status:
              `RESOLVED_${payload.decision}`,

            agent_pipeline_status:
              `Resolved: ${payload.decision}`,
          };
        }


        return exc;
      }
    );


  setStoredItem(
    STORAGE_KEYS.EXCEPTIONS,
    updated
  );


  const currentDecisions =
    getStoredDecisions();


  const filtered =
    currentDecisions.filter(
      (d) =>
        d.id !== record.id
    );


  setStoredItem(
    STORAGE_KEYS.DECISIONS,
    [
      record,
      ...filtered,
    ]
  );
}


/* =========================================================
   Stored decisions
   ========================================================= */

export function getStoredDecisions():
  DecisionRecord[] {

  const items =
    getStoredItem<DecisionRecord[]>(
      STORAGE_KEYS.DECISIONS,
      INITIAL_DECISIONS
    );


  const seen =
    new Set<string>();


  const deduplicated =
    items.filter(
      (item) => {

        if (!item?.id) {
          return false;
        }


        if (
          seen.has(item.id)
        ) {
          return false;
        }


        seen.add(item.id);

        return true;
      }
    );


  if (
    typeof window !== 'undefined' &&
    deduplicated.length !==
      items.length
  ) {

    setStoredItem(
      STORAGE_KEYS.DECISIONS,
      deduplicated
    );
  }


  return deduplicated;
}


/* =========================================================
   Reset mock data
   ========================================================= */

export function resetMockData(): void {

  if (
    typeof window === 'undefined'
  ) {
    return;
  }


  localStorage.removeItem(
    STORAGE_KEYS.EXCEPTIONS
  );


  localStorage.removeItem(
    STORAGE_KEYS.DECISIONS
  );
}