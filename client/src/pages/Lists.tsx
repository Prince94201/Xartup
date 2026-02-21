import { useState } from "react";
import { getLists, saveList, deleteList, removeCompanyFromList } from "@/lib/storage";
import { getCompanyById } from "@/lib/api";
import { SavedList, Company } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { List, Plus, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CompanyCard from "@/components/CompanyCard";
import EmptyState from "@/components/EmptyState";

export default function Lists() {
  const { toast } = useToast();
  const [lists, setLists] = useState<SavedList[]>(getLists);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = () => setLists(getLists());

  const handleCreate = () => {
    if (!newName.trim()) return;
    saveList({ id: crypto.randomUUID(), name: newName.trim(), companyIds: [], createdAt: new Date().toISOString() });
    refresh();
    setCreateOpen(false);
    setNewName("");
    toast({ title: "List created!" });
  };

  const handleDelete = (id: string) => {
    deleteList(id);
    refresh();
    toast({ title: "List deleted" });
  };

  const handleExport = (list: SavedList, format: "json" | "csv") => {
    const companies = list.companyIds.map(getCompanyById).filter(Boolean) as Company[];
    let content: string, type: string, ext: string;

    if (format === "json") {
      content = JSON.stringify(companies, null, 2);
      type = "application/json";
      ext = "json";
    } else {
      const headers = "name,sector,stage,location,website,founded,employees";
      const rows = companies.map((c) => `"${c.name}","${c.sector}","${c.stage}","${c.location}","${c.website}",${c.founded},"${c.employees}"`);
      content = [headers, ...rows].join("\n");
      type = "text/csv";
      ext = "csv";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemoveFromList = (listId: string, companyId: string) => {
    removeCompanyFromList(listId, companyId);
    refresh();
    toast({ title: "Removed from list" });
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Lists</h1>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          New List
        </Button>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          icon={List}
          title="No lists yet"
          description="Create your first list to organize companies"
          action={{ label: "Create your first list", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lists.map((list) => {
            const companies = list.companyIds.map(getCompanyById).filter(Boolean) as Company[];
            const isExpanded = expandedId === list.id;

            return (
              <div key={list.id} className="bg-card border border-border rounded-xl p-5 animate-stagger col-span-1 md:col-span-2 lg:col-span-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{list.name}</h3>
                  <span className="text-xs text-muted-foreground">{new Date(list.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{list.companyIds.length} companies</p>

                {companies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {companies.slice(0, 4).map((c) => (
                      <span key={c.id} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{c.name}</span>
                    ))}
                    {companies.length > 4 && <span className="text-xs px-2 py-0.5 text-muted-foreground">+{companies.length - 4} more</span>}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => setExpandedId(isExpanded ? null : list.id)}>
                    {isExpanded ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                    {isExpanded ? "Hide" : "View"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport(list, "csv")}><Download className="w-3.5 h-3.5 mr-1" />CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport(list, "json")}><Download className="w-3.5 h-3.5 mr-1" />JSON</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(list.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>

                {isExpanded && companies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 gap-3">
                    {companies.map((c, i) => (
                      <CompanyCard key={c.id} company={c} index={i} compact onRemove={() => handleRemoveFromList(list.id, c.id)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New List</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="List name..." onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
            <Button onClick={handleCreate} className="w-full" disabled={!newName.trim()}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
