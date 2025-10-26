import {
  Outlet,
  createRootRoute,
  useRouterState,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "~/components/layout/header";
import { useAuthStore } from "~/store/auth";
import { useWalletStore } from "~/store/wallet";
import { HelpButton } from "~/components/ui/help-button";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const disconnectWallet = useWalletStore((state) => state.disconnectWallet);
  const navigate = useNavigate();
  const location = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    // Disconnect wallet if not authenticated
    if (!isAuthenticated && !isPublicRoute) {
      disconnectWallet();
    }

    // Redirect to login if not authenticated and not on a public route
    if (!isAuthenticated && !isPublicRoute && !isFetching) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isPublicRoute, isFetching, navigate, disconnectWallet]);

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show header on auth pages
  const showHeader = isAuthenticated && !isPublicRoute;

  return (
    <TRPCReactProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-background">
        {showHeader && <Header />}
        <main className={showHeader ? "container py-6 px-4 max-w-7xl mx-auto" : ""}>
          <Outlet />
        </main>
        {showHeader && <HelpButton />}
      </div>
    </TRPCReactProvider>
  );
}
