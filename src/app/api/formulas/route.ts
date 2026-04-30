import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const formulas = await prisma.calculatedFormula.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(formulas);
  } catch (error) {
    console.error('GET /api/formulas error:', error);
    return NextResponse.json({ error: 'Failed to fetch formulas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.calculatedFormula.count();
    const id = `F${String(count + 1).padStart(3, '0')}`;

    const formula = await prisma.calculatedFormula.create({
      data: {
        id,
        name: body.name ?? 'New Metric',
        outputKey: body.outputKey ?? 'custom_field',
        description: body.description ?? 'Custom calculated metric',
        blocks: body.blocks ?? [],
        sortOrder: count,
      },
    });
    return NextResponse.json(formula, { status: 201 });
  } catch (error) {
    console.error('POST /api/formulas error:', error);
    return NextResponse.json({ error: 'Failed to create formula' }, { status: 500 });
  }
}
