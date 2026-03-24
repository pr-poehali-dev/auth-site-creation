import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { apiGetLogs } from "@/lib/api";

type LogLevel = "ALL" | "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  id: string;
  time: string;
  level: string;
  service: string;
  message: string;
  ip: string;
}

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await apiGetLogs({ level: filter, limit: 100 });
      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.total || data.logs.length);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [live, fetchLogs]);

  const filtered = logs.filter((log) =>
    search === "" ||
    log.message.toLowerCase().includes(search.toLowerCase()) ||
    log.service.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: live ? "#00FF88" : "#555" }} />
            LIVE
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            title="Обновить"
          >
            <Icon name={loading ? "Loader2" : "RefreshCw"} size={16} className={loading ? "animate-spin" : ""} />
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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
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
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Icon name="SearchX" size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Нет записей по заданным фильтрам</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Показано {filtered.length} из {total} записей</span>
        <span className="font-mono-code">Обновлено: {new Date().toLocaleTimeString("ru-RU")}</span>
      </div>
    </div>
  );
}
