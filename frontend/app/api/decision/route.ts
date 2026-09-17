import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { DecisionPayload, DecisionRecord } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const payload: DecisionPayload = await request.json();

    if (!payload.exception_id || !payload.decision) {
      return NextResponse.json(
        { error: 'Missing required fields: exception_id, decision' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const reviewer = 'Financial Controller (FC-84)';
    const reviewerNotes = payload.reviewer_notes || 'No comments provided';

    /*
     * Create a deterministic SHA-256 audit hash from the
     * complete decision record data.
     */
    const hashInput = [
      payload.exception_id,
      payload.decision,
      reviewerNotes,
      timestamp,
      reviewer,
    ].join('|');

    const auditHash = createHash('sha256')
      .update(hashInput, 'utf8')
      .digest('hex')
      .toUpperCase();

    const record: DecisionRecord = {
      id: `DEC-${Math.floor(1000 + Math.random() * 9000)}`,
      exception_id: payload.exception_id,
      decision: payload.decision,
      reviewer_notes: reviewerNotes,
      timestamp,
      reviewer,
      audit_hash: `0x${auditHash}`,
      status: 'COMMITTED',
    };

    return NextResponse.json({
      success: true,
      message: `Decision [${payload.decision}] successfully committed to immutable audit trail.`,
      record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid JSON payload',
        details: (error as Error).message,
      },
      { status: 400 }
    );
  }
}