import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAuthStore } from "~/store/auth";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  pin: z.string().min(4, "Please enter your PIN"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const trpc = useTRPC();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation(
    trpc.loginUser.mutationOptions({
      onSuccess: (data) => {
        setAuth(
          data.token,
          data.userId,
          data.email
        );
        toast.success("Welcome back!");
        navigate({ to: "/" });
      },
      onError: (error: any) => {
        toast.error(error.message || "Login failed");
      },
    })
  );

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      pin: data.pin,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-background to-orange-50">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl">
              <svg 
                className="h-9 w-9 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Quipu-inspired design: vertical cord with knots */}
                <line x1="12" y1="4" x2="12" y2="20" />
                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                <line x1="8" y1="8" x2="10.5" y2="8" />
                <line x1="13.5" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="10.5" y2="16" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your wallet
          </p>
        </div>

        {/* Login Form */}
        <Card className="wallet-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email")}
                  error={!!errors.email}
                  disabled={loginMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* PIN */}
              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  PIN
                </label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  {...register("pin")}
                  error={!!errors.pin}
                  disabled={loginMutation.isPending}
                />
                {errors.pin && (
                  <p className="text-sm text-destructive">{errors.pin.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 font-semibold rounded-xl text-base gap-2"
                isLoading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                Sign In
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register Link */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have a wallet?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </div>

        {/* Security Notice */}
        <Card className="bg-secondary/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Connect your Web3 wallet after signing in to access real blockchain transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
