import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ProductWithInventory } from "@shared/types";

interface InventoryStatusProps {
  products: ProductWithInventory[];
}

export function InventoryStatus({ products }: InventoryStatusProps) {
  const getStockStatus = (product: ProductWithInventory) => {
    const stockLevel = (product.stockAvailable || 0) / (product.reorderLevel * 2);
    
    if (stockLevel <= 0.1) {
      return { label: "Critical", color: "bg-red-500" };
    } else if (stockLevel <= 0.35) {
      return { label: "Low Stock", color: "bg-yellow-500" };
    } else {
      return { label: "In Stock", color: "bg-green-500" };
    }
  };
  
  const getPercentage = (product: ProductWithInventory) => {
    const stockLevel = (product.stockAvailable || 0) / (product.reorderLevel * 2);
    return Math.min(Math.max(stockLevel * 100, 0), 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Inventory Status</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="py-3 font-medium">Product</TableHead>
                <TableHead className="py-3 font-medium">SKU</TableHead>
                <TableHead className="py-3 font-medium">Stock</TableHead>
                <TableHead className="py-3 font-medium">Status</TableHead>
                <TableHead className="py-3 font-medium">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = getStockStatus(product);
                const percentage = getPercentage(product);
                
                return (
                  <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{product.sku}</TableCell>
                    <TableCell>{product.stockAvailable || 0}</TableCell>
                    <TableCell>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${status.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.stockValue || 0)}</TableCell>
                  </TableRow>
                );
              })}
              
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3">
        <Link href="/products">
          <Button variant="link" size="sm" className="w-full">
            View all products <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
