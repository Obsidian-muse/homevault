import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-primary bg-primary/10",
  success: "text-emerald-600 bg-emerald-100",
  warning: "text-amber-600 bg-amber-100",
  destructive: "text-red-600 bg-red-100",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneStyles[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
