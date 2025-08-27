"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type RevenuePoint = { month: string; total: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Revenue (last 12 months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2388ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2388ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
              <Area type="monotone" dataKey="total" stroke="#2388ff" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


