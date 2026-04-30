import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const formula = await prisma.calculatedFormula.update({
      where: { id },
      data: {
        name: body.name,
        outputKey: body.outputKey,
        description: body.description,
        blocks: body.blocks,
      },
    });
    return NextResponse.json(formula);
  } catch (error) {
    console.error('PATCH /api/formulas/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update formula' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.calculatedFormula.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/formulas/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete formula' }, { status: 500 });
  }
}
