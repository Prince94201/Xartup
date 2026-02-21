import { SavedList, SavedSearch, EnrichmentResult } from "./types";

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Lists
export function getLists(): SavedList[] {
  return getJSON<SavedList[]>("vc-lists", []);
}

export function saveList(list: SavedList): void {
  const lists = getLists();
  const idx = lists.findIndex((l) => l.id === list.id);
  if (idx >= 0) lists[idx] = list;
  else lists.push(list);
  setJSON("vc-lists", lists);
}

export function deleteList(id: string): void {
  setJSON("vc-lists", getLists().filter((l) => l.id !== id));
}

export function addCompanyToList(listId: string, companyId: string): void {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  if (list && !list.companyIds.includes(companyId)) {
    list.companyIds.push(companyId);
    setJSON("vc-lists", lists);
  }
}

export function removeCompanyFromList(listId: string, companyId: string): void {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  if (list) {
    list.companyIds = list.companyIds.filter((id) => id !== companyId);
    setJSON("vc-lists", lists);
  }
}

// Saved Searches
export function getSavedSearches(): SavedSearch[] {
  return getJSON<SavedSearch[]>("vc-saved-searches", []);
}

export function saveSearch(search: SavedSearch): void {
  const searches = getSavedSearches();
  searches.push(search);
  setJSON("vc-saved-searches", searches);
}

export function deleteSearch(id: string): void {
  setJSON("vc-saved-searches", getSavedSearches().filter((s) => s.id !== id));
}

// Notes
export function getNotes(companyId: string): string {
  return localStorage.getItem(`note-${companyId}`) ?? "";
}

export function saveNotes(companyId: string, notes: string): void {
  localStorage.setItem(`note-${companyId}`, notes);
}

// Enrichment
export function getEnrichment(companyId: string): EnrichmentResult | null {
  return getJSON<EnrichmentResult | null>(`enrich-${companyId}`, null);
}

export function saveEnrichment(companyId: string, result: EnrichmentResult): void {
  setJSON(`enrich-${companyId}`, result);
}

// Recently viewed
export function getRecentlyViewed(): string[] {
  return getJSON<string[]>("recently-viewed", []);
}

export function addRecentlyViewed(companyId: string): void {
  let recent = getRecentlyViewed().filter((id) => id !== companyId);
  recent.unshift(companyId);
  recent = recent.slice(0, 5);
  setJSON("recently-viewed", recent);
}
