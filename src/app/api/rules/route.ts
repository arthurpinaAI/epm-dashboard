import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.redFlagRule.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(rules);
  } catch (error) {
    console.error('GET /api/rules error:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}
