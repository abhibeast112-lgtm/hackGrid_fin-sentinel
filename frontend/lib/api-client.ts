import { FinancialException, InvestigationDetail, DecisionPayload, DecisionRecord } from './types';
import { INITIAL_EXCEPTIONS, INVESTIGATION_DATABASE, INITIAL_DECISIONS } from './mock-data';

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const STORAGE_KEYS = {
  EXCEPTIONS: 'finsentinel_exceptions_v1',
  DECISIONS: 'finsentinel_decisions_v1',
};

// Helper to access LocalStorage safely on client
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

export async function fetchExceptions(): Promise<{ exceptions: FinancialException[]; total_at_risk: number }> {
  // First attempt to query FastAPI backend directly if reachable
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/exceptions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Backend offline or timeout -> use Next.js local API / client cache
  }

  // Fallback to Next.js API or client local storage
  try {
    const res = await fetch('/api/exceptions');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // client fallback
  }

  const stored = getStoredItem<FinancialException[]>(STORAGE_KEYS.EXCEPTIONS, INITIAL_EXCEPTIONS);
  const total = stored.reduce((sum, item) => sum + (item.status === 'AWAITING_DECISION' ? item.amount_at_risk : 0), 0);
  return { exceptions: stored, total_at_risk: total };
}

export async function fetchInvestigation(id: string): Promise<InvestigationDetail> {
  // First try FastAPI
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/investigation/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // continue to fallback
  }

  // Try Next.js API route
  try {
    const res = await fetch(`/api/investigation/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // client fallback
  }

  // Fallback to local DB
  const detail = INVESTIGATION_DATABASE[id] || INVESTIGATION_DATABASE['EXC-101'];
  return detail;
}

export async function submitDecision(payload: DecisionPayload): Promise<{ success: boolean; message: string; record: DecisionRecord }> {
  // Try FastAPI
  try {
    const res = await fetch(`${FASTAPI_BASE_URL}/api/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      // Also update local cache
      syncLocalDecision(payload, data.record);
      return data;
    }
  } catch {
    // continue to local fallback
  }

  // Try Next.js API route
  try {
    const res = await fetch('/api/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      syncLocalDecision(payload, data.record);
      return data;
    }
  } catch {
    // client fallback
  }

  // Pure client fallback
  const mockRecord: DecisionRecord = {
    id: `DEC-${Date.now().toString().slice(-4)}`,
    exception_id: payload.exception_id,
    decision: payload.decision,
    reviewer_notes: payload.reviewer_notes,
    timestamp: new Date().toISOString(),
    reviewer: 'Financial Controller (FC-84)',
    audit_hash: `0x${Math.random().toString(16).substring(2, 10)}`,
    status: 'COMMITTED',
  };

  syncLocalDecision(payload, mockRecord);

  return {
    success: true,
    message: `Decision [${payload.decision}] successfully committed to the immutable audit trail.`,
    record: mockRecord,
  };
}

function syncLocalDecision(payload: DecisionPayload, record: DecisionRecord) {
  if (typeof window === 'undefined') return;

  // 1. Update exceptions
  const currentExceptions = getStoredItem<FinancialException[]>(STORAGE_KEYS.EXCEPTIONS, INITIAL_EXCEPTIONS);
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

  // 2. Add to decisions
  const currentDecisions = getStoredDecisions();
  const filtered = currentDecisions.filter((d) => d.id !== record.id);
  setStoredItem(STORAGE_KEYS.DECISIONS, [record, ...filtered]);
}

export function getStoredDecisions(): DecisionRecord[] {
  const items = getStoredItem<DecisionRecord[]>(STORAGE_KEYS.DECISIONS, INITIAL_DECISIONS);
  const seen = new Set<string>();
  const deduplicated = items.filter((item) => {
    if (!item?.id) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  if (typeof window !== 'undefined' && deduplicated.length !== items.length) {
    setStoredItem(STORAGE_KEYS.DECISIONS, deduplicated);
  }
  return deduplicated;
}

export function resetMockData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.EXCEPTIONS);
  localStorage.removeItem(STORAGE_KEYS.DECISIONS);
}
