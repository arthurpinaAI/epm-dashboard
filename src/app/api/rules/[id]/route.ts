import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const rule = await prisma.redFlagRule.update({
      where: { id },
      data: {
        thresholdValue: body.thresholdValue !== undefined ? body.thresholdValue : undefined,
        gateWeeks: body.gateWeeks !== undefined ? body.gateWeeks : undefined,
        severity: body.severity,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    });
    return NextResponse.json(rule);
  } catch (error) {
    console.error('PATCH /api/rules/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  }
}
