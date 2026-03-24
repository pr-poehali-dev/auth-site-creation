import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface DashboardHomeProps {
  user: User;
}

const STATS = [
  { label: "Активных пользователей", value: "1 248", change: "+12%", icon: "Users", color: "#00F5FF" },
  { label: "API запросов / час", value: "84 320", change: "+5.2%", icon: "Activity", color: "#00FF88" },
  { label: "Ошибок сегодня", value: "23", change: "-34%", icon: "AlertTriangle", color: "#FF6B00" },
  { label: "Uptime", value: "99.97%", change: "стабильно", icon: "Server", color: "#FF006E" },
];

const RECENT_LOGS = [
  { time: "10:44:12", level: "INFO", message: "Пользователь admin@nexus.io авторизован", color: "#00FF88" },
  { time: "10:42:07", level: "WARN", message: "Превышен лимит запросов для IP 192.168.1.45", color: "#FF6B00" },
  { time: "10:41:33", level: "INFO", message: "Новая сессия создана: session_id=abc123xyz", color: "#00FF88" },
  { time: "10:38:50", level: "ERROR", message: "Ошибка подключения к базе данных: timeout", color: "#FF006E" },
  { time: "10:35:20", level: "INFO", message: "Развёртывание v2.4.1 завершено успешно", color: "#00F5FF" },
];

const USERS_LIST = [
  { name: "Алексей Громов", role: "admin", status: "online", avatar: "АГ", color: "#FF006E" },
  { name: "Мария Соколова", role: "manager", status: "online", avatar: "МС", color: "#00F5FF" },
  { name: "Иван Петров", role: "viewer", status: "offline", avatar: "ИП", color: "#00FF88" },
  { name: "Дарья Кузнецова", role: "manager", status: "idle", avatar: "ДК", color: "#00F5FF" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  viewer: "Наблюдатель",
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  online: { color: "#00FF88", label: "Онлайн" },
  offline: { color: "#555", label: "Офлайн" },
  idle: { color: "#FF6B00", label: "Неактивен" },
};

export default function DashboardHome({ user }: DashboardHomeProps) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          Добро пожаловать, <span className="neon-cyan">{user.name.split(" ")[0]}</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Последний вход: {user.lastLogin}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 border border-border hover:border-opacity-50 transition-all duration-300 group"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}20` }}
              >
                <Icon name={stat.icon} size={20} style={{ color: stat.color }} />
              </div>
              <span
                className="text-xs font-mono-code font-semibold px-2 py-1 rounded-full"
                style={{ color: stat.color, background: `${stat.color}15` }}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground tracking-wide">ПОСЛЕДНИЕ СОБЫТИЯ</h3>
            <span className="text-xs text-muted-foreground font-mono-code">реальное время</span>
          </div>
          <div className="space-y-2">
            {RECENT_LOGS.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors group">
                <span className="font-mono-code text-xs text-muted-foreground mt-0.5 flex-shrink-0">{log.time}</span>
                <span
                  className="text-xs font-semibold font-mono-code px-2 py-0.5 rounded flex-shrink-0"
                  style={{ color: log.color, background: `${log.color}20` }}
                >
                  {log.level}
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground tracking-wide">ПОЛЬЗОВАТЕЛИ</h3>
            <span className="text-xs font-mono-code" style={{ color: "#00FF88" }}>
              {USERS_LIST.filter((u) => u.status === "online").length} онлайн
            </span>
          </div>
          <div className="space-y-3">
            {USERS_LIST.map((u, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: `${u.color}20`, color: u.color }}
                  >
                    {u.avatar}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card"
                    style={{ background: STATUS_CONFIG[u.status].color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "API Endpoints", value: "47", sub: "активных маршрутов", icon: "Globe", color: "#00F5FF" },
          { title: "Ролей в системе", value: "3", sub: "уровня доступа", icon: "Shield", color: "#FF006E" },
          { title: "БД запросов / мин", value: "2.4K", sub: "среднее значение", icon: "Database", color: "#00FF88" },
        ].map((card, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-border flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
            >
              <Icon name={card.icon} size={22} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
