import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export interface RecentAssetRow {
  id: string;
  name: string;
  category: string;
  condition: string;
  roomName: string;
  homeName: string;
  currentValue: number | null;
  warrantyStatus: "ACTIVE" | "EXPIRED" | "VOID" | null;
  createdAt: Date;
}

function conditionTone(condition: string) {
  switch (condition) {
    case "NEW":
      return "success";
    case "GOOD":
      return "default";
    case "FAIR":
      return "warning";
    default:
      return "destructive";
  }
}

function warrantyTone(status: RecentAssetRow["warrantyStatus"]) {
  if (status === "ACTIVE") return "success";
  if (status === "EXPIRED") return "destructive";
  return "secondary";
}

export function RecentAssetsTable({ assets }: { assets: RecentAssetRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assets</CardTitle>
        <CardDescription>The latest items added to your vault.</CardDescription>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
            <Package className="h-8 w-8" />
            <p>No assets added yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    <Link href={`/assets/${asset.id}`} className="hover:underline">
                      {asset.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.roomName} · {asset.homeName}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {asset.category.toLowerCase().replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conditionTone(asset.condition) as any}>
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.warrantyStatus ? (
                      <Badge variant={warrantyTone(asset.warrantyStatus) as any}>
                        {asset.warrantyStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {asset.currentValue !== null
                      ? `$${asset.currentValue.toFixed(2)}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
