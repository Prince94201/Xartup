import { useState, useEffect, useCallback, useRef } from "react";
import { getNotes, saveNotes } from "@/lib/storage";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

export default function NotesEditor({ companyId }: { companyId: string }) {
  const [notes, setNotes] = useState(() => getNotes(companyId));
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback((text: string) => {
    saveNotes(companyId, text);
    setLastSaved(new Date().toLocaleTimeString());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [companyId]);

  const handleChange = (value: string) => {
    setNotes(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => save(value), 500);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add your notes about this company..."
        className="min-h-[200px] bg-secondary border-border resize-y text-sm"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-success animate-stagger">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {lastSaved && <span>Last saved: {lastSaved}</span>}
        </div>
        <span>{notes.length} characters</span>
      </div>
    </div>
  );
}
