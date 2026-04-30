import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tiers = await prisma.decisionTier.findMany();
    return NextResponse.json(tiers);
  } catch (error) {
    console.error('GET /api/admin/tiers error:', error);
    return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json() as { level: string; flagCount: number; description: string }[];
    await prisma.$transaction(
      body.map((t) =>
        prisma.decisionTier.upsert({
          where: { level: t.level },
          update: { flagCount: t.flagCount, description: t.description },
          create: { level: t.level, flagCount: t.flagCount, description: t.description },
        }),
      ),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/admin/tiers error:', error);
    return NextResponse.json({ error: 'Failed to update tiers' }, { status: 500 });
  }
}
