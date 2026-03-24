import { useState } from "react";
import { User, UserRole } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const DEMO_USERS = [
  {
    id: "1",
    name: "Алексей Громов",
    email: "admin@nexus.io",
    password: "admin123",
    role: "admin" as UserRole,
    avatar: "АГ",
    lastLogin: "24 марта 2026, 10:32",
  },
  {
    id: "2",
    name: "Мария Соколова",
    email: "manager@nexus.io",
    password: "manager123",
    role: "manager" as UserRole,
    avatar: "МС",
    lastLogin: "23 марта 2026, 17:15",
  },
  {
    id: "3",
    name: "Иван Петров",
    email: "viewer@nexus.io",
    password: "viewer123",
    role: "viewer" as UserRole,
    avatar: "ИП",
    lastLogin: "22 марта 2026, 09:00",
  },
];

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const found = DEMO_USERS.find(
        (u) => u.email === email && u.password === password
      );
      if (found) {
        const { password: _, ...userWithoutPassword } = found;
        onLogin(userWithoutPassword);
      } else {
        setError("Неверный email или пароль");
      }
      setLoading(false);
    }, 800);
  };

  const quickLogin = (demoUser: typeof DEMO_USERS[0]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #00F5FF, transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #FF006E, transparent)" }} />

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00F5FF, #FF006E)" }}>
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-wider text-white">NEXUS<span className="neon-cyan">OS</span></span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">ВХОД В СИСТЕМУ</h1>
          <p className="text-muted-foreground text-sm">Управляйте доступом и ресурсами платформы</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 mb-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <Icon name="Mail" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@nexus.io"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan transition-colors"
                  style={{ "--tw-border-opacity": "1" } as React.CSSProperties}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                Пароль
              </label>
              <div className="relative">
                <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wider transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
              style={{
                background: loading ? "rgba(0,245,255,0.2)" : "linear-gradient(135deg, #00F5FF, #0088ff)",
                color: "#0a0f1a",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Авторизация...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="LogIn" size={16} />
                  ВОЙТИ
                </span>
              )}
            </button>
          </form>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-muted-foreground text-center mb-3 tracking-widest uppercase font-semibold">
            Демо-аккаунты
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => quickLogin(u)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-neon-cyan/50 transition-all duration-200 group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: u.role === "admin"
                      ? "linear-gradient(135deg, #FF006E, #ff4d00)"
                      : u.role === "manager"
                      ? "linear-gradient(135deg, #00F5FF, #0088ff)"
                      : "linear-gradient(135deg, #00FF88, #00aa55)",
                    color: "#0a0f1a"
                  }}
                >
                  {u.avatar}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
