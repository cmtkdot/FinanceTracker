import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@shared/schema";
import { ProductWithInventory } from "@shared/types";

interface ProductGridProps {
  products: ProductWithInventory[];
  onView: (product: ProductWithInventory) => void;
  onEdit: (product: ProductWithInventory) => void;
}

export function ProductGrid({ products, onView, onEdit }: ProductGridProps) {
  const getStockStatus = (product: ProductWithInventory) => {
    const stockLevel = (product.stockAvailable || 0) / (product.reorderLevel * 2);
    
    if (stockLevel <= 0.1) {
      return { label: "Critical", color: "bg-red-500 text-white" };
    } else if (stockLevel <= 0.35) {
      return { label: "Low Stock", color: "bg-yellow-500 text-white" };
    } else {
      return { label: "In Stock", color: "bg-green-500 text-white" };
    }
  };
  
  const getProgressColor = (product: ProductWithInventory) => {
    const stockLevel = (product.stockAvailable || 0) / (product.reorderLevel * 2);
    
    if (stockLevel <= 0.1) {
      return "bg-red-500";
    } else if (stockLevel <= 0.35) {
      return "bg-yellow-500";
    } else {
      return "bg-green-500";
    }
  };
  
  const getPercentage = (product: ProductWithInventory) => {
    const stockLevel = (product.stockAvailable || 0) / (product.reorderLevel * 2);
    return Math.min(Math.max(stockLevel * 100, 0), 100);
  };

  const getPlaceholderImage = (productName: string) => {
    // Use a placeholder service to generate an image based on product name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(productName)}&background=e5e7eb&color=4b5563&size=256`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => {
        const status = getStockStatus(product);
        const progressColor = getProgressColor(product);
        const percentage = getPercentage(product);
        
        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 dark:bg-gray-700 relative">
              <img
                src={product.publicUrlPhoto || getPlaceholderImage(product.name)}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2">
                <Badge className={`${status.color}`}>
                  {status.label}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.unitPrice)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.stockAvailable || 0} units</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inventory</p>
                  <div className="w-24 mt-1">
                    <Progress value={percentage} className={`h-1.5 ${progressColor}`} />
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onView(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {products.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No products found. Add your first product to get started.
        </div>
      )}
    </div>
  );
}
