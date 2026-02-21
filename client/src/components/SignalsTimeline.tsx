import { format } from "date-fns";

type Signal = { date: string; event: string };

export default function SignalsTimeline({ signals }: { signals: Signal[] }) {
  if (!signals.length) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No signals recorded yet
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
      {signals.map((signal, i) => (
        <div key={i} className="relative pb-6 last:pb-0 animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="absolute left-[-18px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
          <time className="text-xs text-muted-foreground block mb-1">
            {format(new Date(signal.date), "MMM d, yyyy")}
          </time>
          <p className="text-sm text-foreground">{signal.event}</p>
        </div>
      ))}
    </div>
  );
}
