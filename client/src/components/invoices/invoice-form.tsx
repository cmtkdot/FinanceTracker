import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Invoice, insertInvoiceSchema, Account, Product } from "@shared/schema";

// Extend the existing schema with more validation
const invoiceFormSchema = insertInvoiceSchema.extend({
  accountId: z.string().uuid("Please select a client"),
  issueDate: z.date({
    required_error: "Issue date is required",
  }),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
  lineItems: z.array(
    z.object({
      productId: z.string().uuid("Please select a product").optional(),
      description: z.string().min(1, "Description is required"),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.coerce.number().min(0, "Price must be a positive number"),
    })
  ).min(1, "At least one line item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  const defaultValues: Partial<InvoiceFormValues> = {
    accountId: "",
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    notes: "",
    lineItems: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice
      ? {
          ...invoice,
          issueDate: new Date(invoice.issueDate),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
          lineItems: invoice.lineItems || defaultValues.lineItems,
        }
      : defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  // Fetch clients and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsResponse = await apiRequest("GET", "/api/accounts?isCustomer=true");
        const productsResponse = await apiRequest("GET", "/api/products");
        
        const clientsData = await clientsResponse.json();
        const productsData = await productsResponse.json();
        
        setClients(clientsData);
        setProducts(productsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [toast]);

  // Calculate totals whenever line items change
  useEffect(() => {
    const values = form.getValues();
    const subtotal = values.lineItems?.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    ) || 0;
    
    const tax = subtotal * 0.1; // 10% tax rate
    const total = subtotal + tax;
    
    setTotals({
      subtotal,
      tax,
      total,
    });
  }, [form.watch("lineItems")]);

  const onSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      if (invoice) {
        await apiRequest("PUT", `/api/invoices/${invoice.id}`, data);
        toast({
          title: "Invoice updated",
          description: "Invoice has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/invoices", data);
        toast({
          title: "Invoice created",
          description: "New invoice has been created successfully.",
        });
      }
      
      // After successful submit
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`lineItems.${index}.description`, product.name);
      form.setValue(`lineItems.${index}.unitPrice`, Number(product.unitPrice));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <FormLabel className="block mb-2">Line Items</FormLabel>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="col-span-5">Product/Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                    <div className="col-span-5">
                      <div className="space-y-2">
                        <Select
                          onValueChange={(value) => handleProductChange(index, value)}
                          defaultValue={form.getValues(`lineItems.${index}.productId`)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({formatCurrency(product.unitPrice)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Description"
                                  className="text-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={1}
                                className="text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                step={0.01}
                                className="text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm py-2 px-3">
                        {formatCurrency(
                          (form.watch(`lineItems.${index}.quantity`) || 0) *
                            (form.watch(`lineItems.${index}.unitPrice`) || 0)
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    append({
                      description: "",
                      quantity: 1,
                      unitPrice: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or terms..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <div className="text-sm flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="text-sm flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Tax (10%):</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="text-sm flex justify-between font-medium">
                <span className="text-gray-800 dark:text-gray-200">Total:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totals.total)}</span>
              </div>
            </div>
            
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></span>
                    Saving...
                  </span>
                ) : (
                  <span>{invoice ? "Update" : "Create"} Invoice</span>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
