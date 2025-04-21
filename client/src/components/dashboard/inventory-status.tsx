import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { ProductWithInventory } from '@shared/types';

interface InventoryStatusProps {
  products: ProductWithInventory[];
}

export function InventoryStatus({ products }: InventoryStatusProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Inventory Status</CardTitle>
        <Link href="/products">
          <Button variant="ghost" className="text-sm text-primary">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                    {product.publicUrlPhoto ? (
                      <img 
                        src={product.publicUrlPhoto} 
                        alt={product.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">No img</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(product.unitPrice)}
                  </div>
                  {getStockBadge(product)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">No products found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStockBadge(product: ProductWithInventory) {
  const stockAvailable = product.stockAvailable || 0;
  const reorderLevel = product.reorderLevel || 5;
  
  if (stockAvailable === 0) {
    return (
      <Badge variant="destructive" className="mt-1">
        Out of Stock
      </Badge>
    );
  } else if (stockAvailable <= reorderLevel) {
    return (
      <Badge 
        variant="secondary" 
        className="mt-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      >
        Low: {stockAvailable}
      </Badge>
    );
  } else {
    return (
      <Badge 
        variant="secondary" 
        className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      >
        In Stock: {stockAvailable}
      </Badge>
    );
  }
}