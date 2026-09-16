import { NextRequest, NextResponse } from 'next/server';
import { INVESTIGATION_DATABASE } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
  const detail = INVESTIGATION_DATABASE[id] || INVESTIGATION_DATABASE['EXC-101'];

  if (!detail) {
    return NextResponse.json(
      { error: `Investigation for ${id} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}
