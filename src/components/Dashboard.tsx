import { useState } from "react";
import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import DashboardHome from "@/components/sections/DashboardHome";
import LogsSection from "@/components/sections/LogsSection";
import ApiDocsSection from "@/components/sections/ApiDocsSection";
import ProfileSection from "@/components/sections/ProfileSection";
import SettingsSection from "@/components/sections/SettingsSection";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type Section = "dashboard" | "logs" | "api" | "profile" | "settings";

const NAV_ITEMS: { id: Section; label: string; icon: string; roles: string[] }[] = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard", roles: ["admin", "manager", "viewer"] },
  { id: "logs", label: "Логирование", icon: "Terminal", roles: ["admin", "manager"] },
  { id: "api", label: "API Документация", icon: "BookOpen", roles: ["admin", "manager"] },
  { id: "profile", label: "Профиль", icon: "User", roles: ["admin", "manager", "viewer"] },
  { id: "settings", label: "Настройки", icon: "Settings", roles: ["admin"] },
];

const ROLE_CONFIG = {
  admin: { label: "Администратор", color: "#FF006E", bg: "rgba(255,0,110,0.15)" },
  manager: { label: "Менеджер", color: "#00F5FF", bg: "rgba(0,245,255,0.15)" },
  viewer: { label: "Наблюдатель", color: "#00FF88", bg: "rgba(0,255,136,0.15)" },
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const roleConfig = ROLE_CONFIG[user.role];
  const availableNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome user={user} />;
      case "logs": return <LogsSection />;
      case "api": return <ApiDocsSection />;
      case "profile": return <ProfileSection user={user} />;
      case "settings": return <SettingsSection />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 transition-all duration-300 flex flex-col border-r border-border`}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #00F5FF, #FF006E)" }}>
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-display text-lg font-bold tracking-wider text-white">
              NEXUS<span className="neon-cyan">OS</span>
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-custom">
          {availableNav.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(0,245,255,0.9), rgba(0,136,255,0.9))",
                  boxShadow: "0 0 20px rgba(0,245,255,0.2)",
                } : {}}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon name={item.icon} size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-background opacity-60" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: roleConfig.bg, color: roleConfig.color }}
              >
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs truncate" style={{ color: roleConfig.color }}>{roleConfig.label}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-muted-foreground hover:text-red-400 transition-colors"
                title="Выйти"
              >
                <Icon name="LogOut" size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-xl hover:bg-secondary/50"
              title="Выйти"
            >
              <Icon name="LogOut" size={18} />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 flex-shrink-0 glass">
          <div>
            <h1 className="text-lg font-display font-semibold text-foreground tracking-wide">
              {availableNav.find((n) => n.id === activeSection)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-neon-green font-mono-code">
              <span className="status-dot animate-pulse-glow" style={{ background: "#00FF88" }} />
              ONLINE
            </div>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#FF006E" }} />
            </button>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: roleConfig.bg, color: roleConfig.color }}
            >
              {user.avatar}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
          <div className="animate-fade-in">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
}
