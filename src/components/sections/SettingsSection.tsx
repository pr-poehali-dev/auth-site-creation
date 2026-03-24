import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { apiGetUsers, apiUpdateUserRole, apiUpdateUserStatus } from "@/lib/api";

const ROLE_COLOR: Record<string, string> = {
  admin: "#FF006E",
  manager: "#00F5FF",
  viewer: "#00FF88",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  viewer: "Наблюдатель",
};

type Tab = "users" | "security" | "system";

export default function SettingsSection() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<{id: string; name: string; email: string; role: string; status: string; avatar: string; created: string}[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(24);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [twoFactor, setTwoFactor] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(true);

  useEffect(() => {
    apiGetUsers().then((data) => {
      if (data.users) setUsers(data.users);
    }).finally(() => setUsersLoading(false));
  }, []);

  const changeRole = async (id: string, newRole: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
    await apiUpdateUserRole(id, newRole);
  };

  const toggleStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === "active" ? "suspended" : "active";
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
    await apiUpdateUserStatus(id, newStatus);
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "users", label: "Пользователи и роли", icon: "Users" },
    { id: "security", label: "Безопасность", icon: "ShieldCheck" },
    { id: "system", label: "Система", icon: "Cpu" },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex gap-2 p-1 glass rounded-xl border border-border w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={tab === t.id ? {
              background: "linear-gradient(135deg, rgba(0,245,255,0.9), rgba(0,136,255,0.9))",
              color: "#0a0f1a",
            } : {
              color: "hsl(var(--muted-foreground))",
            }}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="glass rounded-2xl border border-border overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground tracking-wide">
              УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
            </h3>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(0,245,255,0.12)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.25)" }}
            >
              <Icon name="UserPlus" size={15} />
              Добавить
            </button>
          </div>
          {usersLoading && (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={20} className="animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="divide-y divide-border/50">
            {!usersLoading && users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${ROLE_COLOR[u.role]}15`, color: ROLE_COLOR[u.role] }}
                >
                  {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground">с {u.created}</div>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="bg-secondary/50 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  style={{ color: ROLE_COLOR[u.role] }}
                >
                  {Object.entries(ROLE_LABEL).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
                <button
                  onClick={() => toggleStatus(u.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={u.status === "active" ? {
                    background: "rgba(0,255,136,0.12)",
                    color: "#00FF88",
                  } : {
                    background: "rgba(255,0,110,0.12)",
                    color: "#FF006E",
                  }}
                >
                  {u.status === "active" ? "Активен" : "Заблокирован"}
                </button>
                <button className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass rounded-2xl p-5 border border-border space-y-5">
            <h3 className="font-display font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="neon-cyan" />
              ПАРАМЕТРЫ БЕЗОПАСНОСТИ
            </h3>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Двухфакторная аутентификация</p>
                <p className="text-xs text-muted-foreground">Обязательна для всех администраторов</p>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: twoFactor ? "#00F5FF" : "rgba(255,255,255,0.1)" }}
              >
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                  style={{ left: twoFactor ? "calc(100% - 18px)" : "2px" }} />
              </button>
            </div>

            <div className="py-3 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Время сессии (часов)</p>
                  <p className="text-xs text-muted-foreground">Автовыход через {sessionTimeout}ч</p>
                </div>
                <span className="font-mono-code text-neon-cyan font-bold">{sessionTimeout}</span>
              </div>
              <input
                type="range" min={1} max={72} value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="py-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Макс. попыток входа</p>
                  <p className="text-xs text-muted-foreground">Блокировка после {maxAttempts} ошибок</p>
                </div>
                <span className="font-mono-code text-neon-cyan font-bold">{maxAttempts}</span>
              </div>
              <input
                type="range" min={3} max={10} value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {tab === "system" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Версия системы", value: "v2.4.1", icon: "Tag", color: "#00F5FF" },
              { label: "Среда", value: "Production", icon: "Globe", color: "#00FF88" },
              { label: "БД статус", value: "Connected", icon: "Database", color: "#00FF88" },
            ].map((info, i) => (
              <div key={i} className="glass rounded-2xl p-4 border border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${info.color}15` }}>
                  <Icon name={info.icon} size={17} style={{ color: info.color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  <p className="text-sm font-semibold font-mono-code" style={{ color: info.color }}>{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-5 border border-border space-y-4">
            <h3 className="font-display font-semibold text-foreground tracking-wide flex items-center gap-2">
              <Icon name="Cpu" size={16} style={{ color: "#FF6B00" }} />
              СИСТЕМНЫЕ ПАРАМЕТРЫ
            </h3>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Режим обслуживания</p>
                <p className="text-xs text-muted-foreground">Сайт станет недоступен для пользователей</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="relative w-10 h-5 rounded-full transition-all duration-300"
                style={{ background: maintenanceMode ? "#FF006E" : "rgba(255,255,255,0.1)" }}
              >
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                  style={{ left: maintenanceMode ? "calc(100% - 18px)" : "2px" }} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Режим отладки</p>
                <p className="text-xs text-muted-foreground">Расширенное логирование всех операций</p>
              </div>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="relative w-10 h-5 rounded-full transition-all duration-300"
                style={{ background: debugMode ? "#00F5FF" : "rgba(255,255,255,0.1)" }}
              >
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                  style={{ left: debugMode ? "calc(100% - 18px)" : "2px" }} />
              </button>
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold w-full justify-center transition-all"
            style={{ background: "rgba(255,0,110,0.1)", color: "#FF006E", border: "1px solid rgba(255,0,110,0.2)" }}
          >
            <Icon name="RefreshCw" size={15} />
            Перезапустить систему
          </button>
        </div>
      )}
    </div>
  );
}