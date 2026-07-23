import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const warrantyStyles: Record<string, string> = {
  Active: "border-transparent bg-chart-2/15 text-chart-2",
  "Expiring Soon": "border-transparent bg-chart-4/15 text-chart-4",
  Expired: "border-transparent bg-destructive/15 text-destructive",
}

const conditionStyles: Record<string, string> = {
  Excellent: "border-transparent bg-chart-2/15 text-chart-2",
  Good: "border-transparent bg-primary/15 text-primary",
  Fair: "border-transparent bg-chart-4/15 text-chart-4",
  Poor: "border-transparent bg-destructive/15 text-destructive",
}

export function WarrantyBadge({ status }: { status: string }) {
  return <Badge className={cn(warrantyStyles[status])}>{status}</Badge>
}

export function ConditionBadge({ condition }: { condition: string }) {
  return <Badge className={cn(conditionStyles[condition])}>{condition}</Badge>
}
