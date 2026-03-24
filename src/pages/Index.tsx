import { useState, useEffect } from "react";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import { getToken, apiMe, clearToken } from "@/lib/api";

export type UserRole = "admin" | "manager" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  lastLogin: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setChecking(false);
      return;
    }
    apiMe().then((data) => {
      if (data.user) {
        setUser(data.user);
      } else {
        clearToken();
      }
    }).catch(() => {
      clearToken();
    }).finally(() => {
      setChecking(false);
    });
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
    clearToken();
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00F5FF, #FF006E)" }}>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-mono-code">CONNECTING TO NEXUS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
