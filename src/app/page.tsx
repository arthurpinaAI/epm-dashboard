import { getAllEvents } from '@/lib/event-service';
import { Header } from '@/components/Header';
import { FleetView } from '@/components/fleet/FleetView';
import type { EventSummary } from '@/types';

export const dynamic = 'force-dynamic';

export default async function FleetPage() {
  let events: EventSummary[] = [];
  try {
    events = await getAllEvents();
  } catch {
    // DB not yet connected — show empty state
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header events={events} />
      <main style={{ flex: 1, overflow: 'auto', paddingTop: 28 }}>
        <FleetView initialEvents={events} />
      </main>
    </div>
  );
}
