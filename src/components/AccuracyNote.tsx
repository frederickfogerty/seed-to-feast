import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The accuracy/liability note. Kept in one place so the footer and the finished
 * plan can never drift apart in wording.
 */
export function AccuracyNote({
  className,
  bordered = true,
}: {
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div className={cn(bordered && "border-t border-border/70 pt-5", className)}>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>
          <span className="font-medium text-foreground">A note on accuracy.</span> Seed to Feast
          does its best to give you accurate, useful information, but growing depends on your soil,
          your weather and the seed you buy. Treat the plan as guidance rather than a guarantee:
          nothing here is professional advice, and no responsibility can be accepted for any
          inaccuracy or omission, or for any loss or damage arising from following it.
        </span>
      </p>
    </div>
  );
}
