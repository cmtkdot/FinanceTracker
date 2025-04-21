import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductForm } from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ProductWithInventory } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/products/inventory");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query and active tab
    let filtered = products;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) => 
          product.name.toLowerCase().includes(query) || 
          product.sku.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    // Apply tab filter
    if (activeTab === "low") {
      filtered = filtered.filter((product) => 
        (product.stockAvailable || 0) > 0 && 
        (product.stockAvailable || 0) <= product.reorderLevel
      );
    } else if (activeTab === "out") {
      filtered = filtered.filter((product) => 
        (product.stockAvailable || 0) === 0
      );
    } else if (activeTab === "in") {
      filtered = filtered.filter((product) => 
        (product.stockAvailable || 0) > product.reorderLevel
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, activeTab, products]);

  const handleCreateClick = () => {
    setSelectedProduct(undefined);
    setModalOpen(true);
  };

  const handleViewProduct = (product: ProductWithInventory) => {
    // View product details in a modal or navigate to a details page
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleEditProduct = (product: ProductWithInventory) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(undefined);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    queryClient.invalidateQueries({ queryKey: ['/api/products/inventory'] });
    fetchProducts();
  };

  return (
    <DashboardLayout title="Products">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage products and inventory</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="in">In Stock</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
          <TabsTrigger value="out">Out of Stock</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ProductGrid 
              products={filteredProducts} 
              onView={handleViewProduct}
              onEdit={handleEditProduct}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl">
          <ProductForm 
            product={selectedProduct} 
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}