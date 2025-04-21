import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercentChange } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeTimeframe?: string;
  trend?: "up" | "down" | "neutral";
  isCurrency?: boolean;
  isPercent?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  change,
  changeTimeframe = "vs last month",
  trend = "neutral",
  isCurrency = false,
  isPercent = false,
  icon,
}: KpiCardProps) {
  const formattedValue = isCurrency
    ? formatCurrency(value)
    : isPercent
    ? `${value}%`
    : value;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{formattedValue}</h4>
            
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {trend === "up" ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : trend === "down" ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                
                <span
                  className={
                    trend === "up"
                      ? "text-green-500 text-sm font-medium"
                      : trend === "down"
                      ? "text-red-500 text-sm font-medium"
                      : "text-gray-500 text-sm font-medium"
                  }
                >
                  {formatPercentChange(change)} {changeTimeframe}
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="bg-primary/10 p-3 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}