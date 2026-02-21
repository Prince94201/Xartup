import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCompany, enrichCompany } from "@/lib/api";
import { Company, EnrichmentResult, SECTOR_COLORS, STAGE_STYLES } from "@/lib/types";
import { getEnrichment, saveEnrichment, addRecentlyViewed, getLists, addCompanyToList, saveList } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, MapPin, Calendar, Users, Building2, Bookmark, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import EnrichmentPanel from "@/components/EnrichmentPanel";
import SignalsTimeline from "@/components/SignalsTimeline";
import NotesEditor from "@/components/NotesEditor";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [enrichCached, setEnrichCached] = useState(false);
  const [listPickerOpen, setListPickerOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCompany(id)
      .then((c) => {
        setCompany(c);
        addRecentlyViewed(c.id);
        // Load cached enrichment
        const cached = getEnrichment(c.id);
        if (cached) {
          setEnrichment(cached);
          setEnrichCached(true);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnrich = async () => {
    if (!company) return;
    setEnrichLoading(true);
    setEnrichError(null);
    setEnrichCached(false);
    try {
      const result = await enrichCompany(company.website);
      setEnrichment(result);
      saveEnrichment(company.id, result);
      toast({ title: "Enrichment complete!" });
    } catch (err: any) {
      setEnrichError(err.message);
      toast({ title: "Enrichment failed", description: err.message, variant: "destructive" });
    } finally {
      setEnrichLoading(false);
    }
  };

  const handleExport = () => {
    if (!company) return;
    const blob = new Blob([JSON.stringify(company, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${company.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lists = getLists();
  const handleAddToList = (listId: string) => {
    if (company) {
      addCompanyToList(listId, company.id);
      toast({ title: "Added to list" });
      setListPickerOpen(false);
    }
  };
  const handleCreateAndAdd = () => {
    if (!newListName.trim() || !company) return;
    const newList = { id: crypto.randomUUID(), name: newListName.trim(), companyIds: [company.id], createdAt: new Date().toISOString() };
    saveList(newList);
    toast({ title: `Created "${newList.name}"` });
    setListPickerOpen(false);
    setNewListName("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 skeleton-shimmer rounded" />
        <div className="h-8 w-64 skeleton-shimmer rounded" />
        <div className="h-4 w-48 skeleton-shimmer rounded" />
        <div className="flex gap-2"><div className="h-7 w-20 skeleton-shimmer rounded-full" /><div className="h-7 w-16 skeleton-shimmer rounded-full" /></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Company not found</h2>
        <p className="text-muted-foreground mb-6">{error || "This company doesn't exist."}</p>
        <Button asChild variant="outline"><Link to="/companies"><ArrowLeft className="w-4 h-4 mr-2" />Back to Companies</Link></Button>
      </div>
    );
  }

  const sectorStyle = SECTOR_COLORS[company.sector] || "bg-muted text-muted-foreground";
  const stageStyle = STAGE_STYLES[company.stage] || "border border-border text-muted-foreground";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Link to="/companies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Companies
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{company.name}</h1>
          <a href={company.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            {company.website} <ExternalLink className="w-3 h-3" />
          </a>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sectorStyle}`}>{company.sector}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stageStyle}`}>{company.stage}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{company.location}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{company.founded}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{company.employees}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setListPickerOpen(true)}><Bookmark className="w-4 h-4 mr-1.5" />Save to List</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1.5" />Export</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Founded", value: String(company.founded) },
              { label: "Employees", value: company.employees },
              { label: "Location", value: company.location },
              { label: "Sector", value: company.sector },
              { label: "Stage", value: company.stage },
              { label: "Website", value: company.website, link: true },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                {item.link ? (
                  <a href={item.value} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate block">{item.value}</a>
                ) : (
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                )}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {company.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="signals" className="mt-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <SignalsTimeline signals={company.signals} />
          </div>
        </TabsContent>

        <TabsContent value="enrichment" className="mt-6">
          <EnrichmentPanel
            result={enrichment}
            loading={enrichLoading}
            error={enrichError}
            cached={enrichCached}
            onEnrich={handleEnrich}
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <NotesEditor companyId={company.id} />
          </div>
        </TabsContent>
      </Tabs>

      {/* List Picker */}
      <Dialog open={listPickerOpen} onOpenChange={setListPickerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save to List</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {lists.length > 0 ? lists.map((list) => (
              <button key={list.id} onClick={() => handleAddToList(list.id)} className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-foreground transition-colors">
                {list.name} <span className="text-muted-foreground">({list.companyIds.length})</span>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-2">No lists yet</p>
            )}
            <div className="border-t border-border pt-3 flex gap-2">
              <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="New list name..." onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()} />
              <Button onClick={handleCreateAndAdd} disabled={!newListName.trim()} size="sm">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
