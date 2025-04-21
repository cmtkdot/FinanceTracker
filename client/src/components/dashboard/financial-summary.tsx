import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialSummary as FinancialSummaryType } from "@shared/types";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FinancialSummaryProps {
  data: FinancialSummaryType[];
}

type Period = "monthly" | "quarterly" | "yearly";

export function FinancialSummary({ data }: FinancialSummaryProps) {
  const [activePeriod, setActivePeriod] = useState<Period>("monthly");

  // This would filter data based on the selected period in a real implementation
  const filteredData = data;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base font-semibold">Financial Summary</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={activePeriod === "monthly" ? "default" : "outline"}
              className="text-xs h-7 px-2 py-1"
              onClick={() => setActivePeriod("monthly")}
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant={activePeriod === "quarterly" ? "default" : "outline"}
              className="text-xs h-7 px-2 py-1"
              onClick={() => setActivePeriod("quarterly")}
            >
              Quarterly
            </Button>
            <Button
              size="sm"
              variant={activePeriod === "yearly" ? "default" : "outline"}
              className="text-xs h-7 px-2 py-1"
              onClick={() => setActivePeriod("yearly")}
            >
              Yearly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), ""]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
              <Bar dataKey="profit" name="Profit" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0) / data.length)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
            <p className="font-semibold text-red-600 dark:text-red-400 mt-1">
              {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0) / data.length)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
            <p className="font-semibold text-green-600 dark:text-green-400 mt-1">
              {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0) / data.length)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
