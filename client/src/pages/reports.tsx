import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { DateRange } from "@/components/ui/date-range";
import { Download, FileText, FileBarChart, ArrowDownToLine } from "lucide-react";

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const salesData = [
  { month: 'Jan', revenue: 12400, expenses: 8300, profit: 4100 },
  { month: 'Feb', revenue: 15600, expenses: 9200, profit: 6400 },
  { month: 'Mar', revenue: 18200, expenses: 10100, profit: 8100 },
  { month: 'Apr', revenue: 16800, expenses: 9800, profit: 7000 },
  { month: 'May', revenue: 19500, expenses: 11200, profit: 8300 },
  { month: 'Jun', revenue: 22100, expenses: 12400, profit: 9700 },
];

const productSales = [
  { name: 'Widget A', value: 32 },
  { name: 'Widget B', value: 24 },
  { name: 'Gadget X', value: 18 },
  { name: 'Gadget Y', value: 14 },
  { name: 'Tool Z', value: 12 },
];

const customerSales = [
  { name: 'Acme Corp', value: 28 },
  { name: 'Globex Inc', value: 22 },
  { name: 'Initech', value: 19 },
  { name: 'Umbrella Corp', value: 17 },
  { name: 'Wayne Enterprises', value: 14 },
];

export default function Reports() {
  const [reportPeriod, setReportPeriod] = useState("last6Months");
  const [reportType, setReportType] = useState("sales");
  
  const handleDownloadReport = () => {
    // In a real app, this would generate and download a report
    alert("Report download functionality will be implemented here.");
  };
  
  return (
    <DashboardLayout title="Reports">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">View financial and business performance reports</p>
        </div>
        <Button onClick={handleDownloadReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Report Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="inventory">Inventory Report</SelectItem>
                <SelectItem value="customers">Customer Report</SelectItem>
                <SelectItem value="expenses">Expense Report</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="last6Months">Last 6 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DateRange />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">
            <FileBarChart className="mr-2 h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Data Tables
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue, Expenses and Profit</CardTitle>
              <CardDescription>Financial performance over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Sales</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productSales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {productSales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Revenue</CardTitle>
                <CardDescription>Customers generating highest revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSales}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {customerSales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Revenue trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#4f46e5" activeDot={{ r: 8 }} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Download detailed reports in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">Sales Summary Report</p>
                      <p className="text-sm text-gray-500">Complete financial overview of sales</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Inventory Status Report</p>
                      <p className="text-sm text-gray-500">Current stock levels and inventory value</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium">Customer Accounts Report</p>
                      <p className="text-sm text-gray-500">Customer balances and activity</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-medium">Vendor Accounts Report</p>
                      <p className="text-sm text-gray-500">Vendor balances and purchase history</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium">Expense Summary Report</p>
                      <p className="text-sm text-gray-500">Breakdown of all business expenses</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}