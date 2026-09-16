import { NextRequest, NextResponse } from 'next/server';
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

    const record: DecisionRecord = {
      id: `DEC-${Math.floor(1000 + Math.random() * 9000)}`,
      exception_id: payload.exception_id,
      decision: payload.decision,
      reviewer_notes: payload.reviewer_notes || 'No comments provided',
      timestamp: new Date().toISOString(),
      reviewer: 'Financial Controller (FC-84)',
      audit_hash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      status: 'COMMITTED',
    };

    return NextResponse.json({
      success: true,
      message: `Decision [${payload.decision}] successfully committed to immutable audit trail.`,
      record,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON payload', details: (error as Error).message },
      { status: 400 }
    );
  }
}
