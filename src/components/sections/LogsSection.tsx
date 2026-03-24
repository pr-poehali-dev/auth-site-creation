import { useState } from "react";
import Icon from "@/components/ui/icon";

type LogLevel = "ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG";

const ALL_LOGS = [
  { id: 1, time: "10:44:12.345", level: "INFO", service: "auth", message: "Пользователь admin@nexus.io успешно авторизован", ip: "192.168.1.1" },
  { id: 2, time: "10:43:55.123", level: "WARN", service: "api", message: "Превышен лимит запросов: 1000/мин для IP 192.168.1.45", ip: "192.168.1.45" },
  { id: 3, time: "10:43:20.789", level: "ERROR", service: "db", message: "Connection timeout after 30s: PostgreSQL host unreachable", ip: "10.0.0.5" },
  { id: 4, time: "10:42:44.456", level: "DEBUG", service: "api", message: "GET /api/v1/users?page=1&limit=50 → 200 OK [42ms]", ip: "192.168.1.22" },
  { id: 5, time: "10:42:07.001", level: "INFO", service: "deploy", message: "Развёртывание v2.4.1 завершено успешно", ip: "10.0.0.1" },
  { id: 6, time: "10:41:33.678", level: "INFO", service: "auth", message: "Создана новая сессия: session_id=abc123xyz lifetime=24h", ip: "192.168.1.3" },
  { id: 7, time: "10:40:10.234", level: "ERROR", service: "mail", message: "SMTP error: Connection refused to smtp.nexus.io:587", ip: "10.0.0.8" },
  { id: 8, time: "10:39:45.567", level: "WARN", service: "cache", message: "Redis memory usage at 85% capacity", ip: "10.0.0.9" },
  { id: 9, time: "10:38:22.890", level: "DEBUG", service: "api", message: "POST /api/v1/auth/login → 401 Unauthorized [12ms]", ip: "192.168.1.99" },
  { id: 10, time: "10:37:15.123", level: "INFO", service: "cron", message: "Плановая задача backup запущена: backup_users_20260324", ip: "10.0.0.1" },
  { id: 11, time: "10:36:05.456", level: "INFO", service: "api", message: "DELETE /api/v1/sessions/xyz789 → 204 No Content [8ms]", ip: "192.168.1.7" },
  { id: 12, time: "10:35:50.789", level: "WARN", service: "auth", message: "Неудачная попытка входа: 3/5 для user@nexus.io", ip: "192.168.1.45" },
];

const LEVEL_CONFIG: Record<string, { color: string; bg: string }> = {
  INFO: { color: "#00FF88", bg: "rgba(0,255,136,0.12)" },
  WARN: { color: "#FF6B00", bg: "rgba(255,107,0,0.12)" },
  ERROR: { color: "#FF006E", bg: "rgba(255,0,110,0.12)" },
  DEBUG: { color: "#00F5FF", bg: "rgba(0,245,255,0.12)" },
};

const SERVICE_COLOR: Record<string, string> = {
  auth: "#a78bfa",
  api: "#00F5FF",
  db: "#FF006E",
  deploy: "#00FF88",
  mail: "#FF6B00",
  cache: "#f59e0b",
  cron: "#60a5fa",
};

export default function LogsSection() {
  const [filter, setFilter] = useState<LogLevel>("ALL");
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(true);

  const filtered = ALL_LOGS.filter((log) => {
    const matchLevel = filter === "ALL" || log.level === filter;
    const matchSearch = search === "" ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {(["ALL", "INFO", "WARN", "ERROR", "DEBUG"] as LogLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-code transition-all duration-200"
              style={filter === lvl ? {
                background: lvl === "ALL" ? "rgba(255,255,255,0.15)" : LEVEL_CONFIG[lvl]?.bg,
                color: lvl === "ALL" ? "#fff" : LEVEL_CONFIG[lvl]?.color,
                border: `1px solid ${lvl === "ALL" ? "rgba(255,255,255,0.2)" : LEVEL_CONFIG[lvl]?.color}50`,
              } : {
                background: "transparent",
                color: "#666",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск в логах..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setLive(!live)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={live ? {
              background: "rgba(0,255,136,0.12)",
              color: "#00FF88",
              border: "1px solid rgba(0,255,136,0.3)",
            } : {
              background: "transparent",
              color: "#666",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className={`status-dot ${live ? "animate-pulse-glow" : ""}`}
              style={{ background: live ? "#00FF88" : "#555" }} />
            LIVE
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
            <Icon name="Download" size={16} />
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-secondary/20">
          <span className="text-xs text-muted-foreground font-mono-code w-28">ВРЕМЯ</span>
          <span className="text-xs text-muted-foreground font-mono-code w-16">УРОВЕНЬ</span>
          <span className="text-xs text-muted-foreground font-mono-code w-16">СЕРВИС</span>
          <span className="text-xs text-muted-foreground font-mono-code flex-1">СООБЩЕНИЕ</span>
          <span className="text-xs text-muted-foreground font-mono-code w-28 hidden lg:block">IP</span>
        </div>

        <div className="divide-y divide-border/50">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/20 transition-colors group"
            >
              <span className="font-mono-code text-xs text-muted-foreground w-28 flex-shrink-0 mt-0.5">
                {log.time}
              </span>
              <span
                className="text-xs font-semibold font-mono-code px-2 py-0.5 rounded w-16 flex-shrink-0 text-center"
                style={{
                  color: LEVEL_CONFIG[log.level]?.color,
                  background: LEVEL_CONFIG[log.level]?.bg,
                }}
              >
                {log.level}
              </span>
              <span
                className="text-xs font-semibold font-mono-code w-16 flex-shrink-0 mt-0.5"
                style={{ color: SERVICE_COLOR[log.service] || "#888" }}
              >
                [{log.service}]
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 font-mono-code leading-relaxed">
                {log.message}
              </span>
              <span className="font-mono-code text-xs text-muted-foreground w-28 flex-shrink-0 hidden lg:block mt-0.5">
                {log.ip}
              </span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Icon name="SearchX" size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Нет записей по заданным фильтрам</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Показано {filtered.length} из {ALL_LOGS.length} записей</span>
        <span className="font-mono-code">Обновлено: {new Date().toLocaleTimeString("ru-RU")}</span>
      </div>
    </div>
  );
}
