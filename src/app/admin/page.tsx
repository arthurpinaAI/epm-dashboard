import { prisma } from '@/lib/prisma';
import { getAllEvents } from '@/lib/event-service';
import { Header } from '@/components/Header';
import { AdminPanel } from '@/components/admin/AdminPanel';
import type { FormulaRow, FormulaBlock, RuleRow, TierRow, DropdownRow, EventSummary } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let events: EventSummary[] = [];
  let rules: RuleRow[] = [];
  let formulas: FormulaRow[] = [];
  let tiers: TierRow[] = [];
  let dropdowns: DropdownRow[] = [];

  try {
    [events, rules, formulas, tiers, dropdowns] = await Promise.all([
      getAllEvents(),
      prisma.redFlagRule.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.calculatedFormula.findMany({ orderBy: { sortOrder: 'asc' } }).then((rows) =>
        rows.map((r) => ({
          ...r,
          blocks: (r.blocks as unknown) as FormulaBlock[],
        })),
      ),
      prisma.decisionTier.findMany(),
      prisma.dropdownOption.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] }),
    ]);
  } catch {
    // DB not connected — render with empty defaults
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header events={events} />
      <main style={{ flex: 1, overflow: 'auto', paddingTop: 28 }}>
        <AdminPanel
          initialRules={rules as RuleRow[]}
          initialFormulas={formulas}
          initialTiers={tiers}
          initialDropdowns={dropdowns}
        />
      </main>
    </div>
  );
}
