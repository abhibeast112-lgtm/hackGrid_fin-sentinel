import { NextResponse } from 'next/server';
import { INITIAL_EXCEPTIONS } from '@/lib/mock-data';

export async function GET() {
  const total = INITIAL_EXCEPTIONS.reduce((sum, item) => sum + item.amount_at_risk, 0);
  return NextResponse.json({
    exceptions: INITIAL_EXCEPTIONS,
    total_at_risk: total,
    count: INITIAL_EXCEPTIONS.length,
    timestamp: new Date().toISOString(),
  });
}
