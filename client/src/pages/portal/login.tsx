import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define schema for portal login form
const portalLoginSchema = z.object({
  accountUid: z.string().min(1, { message: "Please enter your Account ID" }),
  pin: z.string().min(4, { message: "PIN must be at least 4 characters" }),
});

type PortalLoginFormValues = z.infer<typeof portalLoginSchema>;

export default function PortalLogin() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PortalLoginFormValues>({
    resolver: zodResolver(portalLoginSchema),
    defaultValues: {
      accountUid: "",
      pin: "",
    },
  });

  const onSubmit = async (values: PortalLoginFormValues) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/portal/login", values);
      toast({
        title: "Login Successful",
        description: "You have been logged in to the portal successfully.",
      });
      navigate("/portal");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid Account ID or PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Client Portal
          </CardTitle>
          <CardDescription>
            Sign in to view your invoices, estimates, and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accountUid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Account ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your PIN"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
          <div className="w-full">
            Don't have an account? Please contact your account manager.
          </div>
        </CardFooter>
      </Card>
      
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400">
        Looking for the admin login? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Click here</a>
      </div>
    </div>
  );
}