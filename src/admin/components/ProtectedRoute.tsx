import { Navigate } from "react-router-dom";
import { useAuth } from "@/admin/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isCmsAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!session || !isCmsAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
