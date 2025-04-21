import { ProductWithInventory } from "@shared/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Eye, Edit, Package } from "lucide-react";

interface ProductGridProps {
  products: ProductWithInventory[];
  onView: (product: ProductWithInventory) => void;
  onEdit: (product: ProductWithInventory) => void;
}

export function ProductGrid({ products, onView, onEdit }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No products</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No products found that match your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden h-full flex flex-col">
          <div className="h-48 bg-gray-200 dark:bg-gray-800 relative flex items-center justify-center">
            {product.publicUrlPhoto ? (
              <img
                src={product.publicUrlPhoto}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-16 w-16 text-gray-400" />
            )}

            {/* Stock Status Badge */}
            {(product.stockAvailable === 0 || product.stockQuantity === 0) ? (
              <Badge 
                variant="destructive" 
                className="absolute top-2 right-2"
              >
                Out of Stock
              </Badge>
            ) : (product.stockAvailable || 0) <= (product.reorderLevel || 5) ? (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
              >
                Low Stock ({product.stockAvailable})
              </Badge>
            ) : (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              >
                In Stock ({product.stockAvailable})
              </Badge>
            )}
          </div>

          <CardContent className="p-4 flex-grow">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700 text-xs">
                SKU: {product.sku}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">
              {product.description || "No description available"}
            </p>
            <div className="mt-2 font-medium text-lg">
              {formatCurrency(product.unitPrice)}
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="flex space-x-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onView(product)}
              >
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}