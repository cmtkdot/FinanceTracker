import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect, useRef } from "react"
import { useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth-provider";

// Define the login form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Define the registration form validation schema
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, login, checkAuth } = useAuth();
  
  // Check if user is already authenticated
  useEffect(() => {
    const verifyLoggedIn = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated || user) {
        console.log("User is already authenticated, redirecting to dashboard");
        setLocation("/dashboard");
      }
    };
    
    verifyLoggedIn();
  }, [checkAuth, setLocation, user]);
  
  // Initialize the login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize the registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await login(values.email, values.password);
      
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
      
      // Redirect is handled by the login function
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: 'user' // Default role for new users
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(data.message || 'Registration failed');
      }
      
      toast({
        title: "Success",
        description: "Your account has been created. You are now logged in.",
      });
      
      // Redirect to dashboard
      await checkAuth(); // Update auth state
      setLocation("/dashboard");
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Financial & Inventory Management</CardTitle>
            <CardDescription className="text-center">
              Log in or create an account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" autoComplete="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••" 
                              autoComplete="current-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              autoComplete="name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              autoComplete="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••" 
                              autoComplete="new-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Protected by secure authentication
          </CardFooter>
        </Card>
      </div>
      
      {/* Right column with hero banner */}
      <div className="w-full md:w-1/2 bg-primary/5 hidden md:flex flex-col items-center justify-center p-12">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Streamline Your Business Finances
            </span>
          </h1>
          <p className="text-xl mb-8">
            A comprehensive solution for managing invoices, inventory, purchase orders and more - all in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Financial Management</h3>
              <p className="text-muted-foreground">Track invoices, payments, and financial metrics with ease.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Inventory Control</h3>
              <p className="text-muted-foreground">Manage product stock levels and optimize inventory turnover.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Purchase Orders</h3>
              <p className="text-muted-foreground">Create and track purchase orders with your vendors.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Business Intelligence</h3>
              <p className="text-muted-foreground">Gain insights from comprehensive reports and dashboards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}