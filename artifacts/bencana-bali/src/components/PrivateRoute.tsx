import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export function PrivateRoute({ component: Component, ...props }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location);
    return <Redirect to={`/login?redirect=${redirect}`} />;
  }

  return <Component {...props} />;
}
