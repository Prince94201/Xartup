import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
};

export default function EmptyState({ icon: Icon, title, description, action, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>

        <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
        <p className="mx-auto mb-5 text-sm text-muted-foreground">{description}</p>

        {action && (
          <Button onClick={action.onClick} className="w-full sm:w-auto sm:px-6">
            {action.label}
          </Button>
        )}

        {children}
      </div>
    </div>
  );
}
