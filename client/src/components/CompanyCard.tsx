import { Company, SECTOR_COLORS, STAGE_STYLES } from "@/lib/types";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Bookmark, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  company: Company;
  index?: number;
  onEnrich?: (company: Company) => void;
  onSave?: (company: Company) => void;
  compact?: boolean;
  onRemove?: (company: Company) => void;
};

export default function CompanyCard({ company, index = 0, onEnrich, onSave, compact, onRemove }: Props) {
  const sectorStyle = SECTOR_COLORS[company.sector] || "bg-muted text-muted-foreground";
  const stageStyle = STAGE_STYLES[company.stage] || "border border-border text-muted-foreground";

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 card-hover animate-stagger"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sectorStyle}`}>
          {company.sector}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stageStyle}`}>
          {company.stage}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1.5">{company.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{company.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{company.founded}</span>
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{company.employees}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{company.location}</span>
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {company.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
              {tag}
            </span>
          ))}
          {company.tags.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-muted-foreground">+{company.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button asChild size="sm" className="flex-1">
          <Link to={`/companies/${company.id}`}>
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            View Profile
          </Link>
        </Button>
        {onSave && (
          <Button size="sm" variant="outline" onClick={() => onSave(company)} className="px-2.5">
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
        )}
        {onEnrich && (
          <Button size="sm" variant="outline" onClick={() => onEnrich(company)} className="px-2.5">
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
        )}
        {onRemove && (
          <Button size="sm" variant="destructive" onClick={() => onRemove(company)} className="px-2.5 text-xs">
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
