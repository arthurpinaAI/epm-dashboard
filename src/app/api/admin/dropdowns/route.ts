import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const options = await prisma.dropdownOption.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
    return NextResponse.json(options);
  } catch (error) {
    console.error('GET /api/admin/dropdowns error:', error);
    return NextResponse.json({ error: 'Failed to fetch dropdown options' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { category: string; value: string };
    const count = await prisma.dropdownOption.count({ where: { category: body.category } });
    const option = await prisma.dropdownOption.create({
      data: { category: body.category, value: body.value, sortOrder: count },
    });
    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/dropdowns error:', error);
    return NextResponse.json({ error: 'Failed to create dropdown option' }, { status: 500 });
  }
}
