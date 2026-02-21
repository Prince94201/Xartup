import { EnrichmentResult } from "@/lib/types";
import { Sparkles, CheckCircle2, ExternalLink, Copy, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  result: EnrichmentResult | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  onEnrich: () => void;
};

export default function EnrichmentPanel({ result, loading, error, cached, onEnrich }: Props) {
  const { toast } = useToast();

  if (!result && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Enrich this company</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Pull live data from their public website using AI
        </p>
        <Button onClick={onEnrich} size="lg">
          <Sparkles className="w-4 h-4 mr-2" /> Run Enrichment
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border p-5">
            <div className="h-4 w-32 skeleton-shimmer rounded mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full skeleton-shimmer rounded" />
              <div className="h-3 w-3/4 skeleton-shimmer rounded" />
            </div>
          </div>
        ))}
        <p className="text-sm text-muted-foreground text-center animate-pulse">Extracting insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium mb-3">{error}</p>
        <Button onClick={onEnrich} variant="outline" size="sm">Try again</Button>
      </div>
    );
  }

  if (!result) return null;

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      {cached && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg">
          <Clock className="w-3 h-3" /> Cached result
        </div>
      )}

      <div className="rounded-xl border border-border p-5">
        <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
      </div>

      <div className="rounded-xl border border-border p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">What They Do</h4>
        <ul className="space-y-2">
          {result.what_they_do.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {result.keywords.map((kw) => (
            <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">Signals</h4>
        <ul className="space-y-2">
          {result.signals.map((sig, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              {sig}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">Sources</h4>
        <ul className="space-y-2">
          {result.sources.map((src, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              <a href={src.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                {src.url}
              </a>
              <span className="text-xs text-muted-foreground/50 shrink-0">
                {new Date(src.timestamp).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
        <span>Enriched at {new Date(result.cached_at).toLocaleString()}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyJSON}>
            <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON
          </Button>
          <Button size="sm" variant="outline" onClick={onEnrich}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-enrich
          </Button>
        </div>
      </div>
    </div>
  );
}
