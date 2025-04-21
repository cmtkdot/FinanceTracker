import { ArrowDown, ArrowUp, DollarSign, FileText, Package, ShoppingCart } from "lucide-react";
import { formatCurrency, formatPercentChange } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { KpiMetric } from "@shared/types";

interface KPICardProps {
  data: KpiMetric;
}

export function KPICard({ data }: KPICardProps) {
  const getIcon = () => {
    switch (data.icon) {
      case 'dollar-sign':
        return <DollarSign className="h-5 w-5" />;
      case 'file-invoice-dollar':
        return <FileText className="h-5 w-5" />;
      case 'shopping-cart':
        return <ShoppingCart className="h-5 w-5" />;
      case 'boxes':
        return <Package className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getBgColor = () => {
    switch (data.icon) {
      case 'dollar-sign':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'file-invoice-dollar':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'shopping-cart':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'boxes':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getChangeColor = () => {
    if (data.changeDirection === 'up') {
      return data.icon === 'shopping-cart' 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-green-600 dark:text-green-400';
    } else if (data.changeDirection === 'down') {
      return data.icon === 'shopping-cart' 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{data.label}</p>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(data.value)}
            </h3>
            <p className="text-sm mt-2">
              <span className={getChangeColor()}>
                {data.changeDirection === 'up' ? (
                  <ArrowUp className="inline-block h-3 w-3 mr-1" />
                ) : data.changeDirection === 'down' ? (
                  <ArrowDown className="inline-block h-3 w-3 mr-1" />
                ) : null}
                {formatPercentChange(data.changePercent)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </p>
          </div>
          <div className={`p-3 rounded-full ${getBgColor()}`}>
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
