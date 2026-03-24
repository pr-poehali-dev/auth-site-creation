import { useState } from "react";
import Icon from "@/components/ui/icon";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/users",
    description: "Получить список всех пользователей",
    auth: true,
    roles: ["admin", "manager"],
    params: [
      { name: "page", type: "integer", required: false, description: "Номер страницы (по умолчанию 1)" },
      { name: "limit", type: "integer", required: false, description: "Количество на странице (макс. 100)" },
      { name: "role", type: "string", required: false, description: "Фильтр по роли: admin | manager | viewer" },
    ],
    response: `{\n  "data": [\n    {\n      "id": "string",\n      "name": "string",\n      "email": "string",\n      "role": "admin | manager | viewer",\n      "createdAt": "ISO8601"\n    }\n  ],\n  "total": 1248,\n  "page": 1,\n  "limit": 50\n}`,
  },
  {
    method: "POST",
    path: "/api/v1/auth/login",
    description: "Авторизация пользователя",
    auth: false,
    roles: [],
    params: [
      { name: "email", type: "string", required: true, description: "Email пользователя" },
      { name: "password", type: "string", required: true, description: "Пароль (минимум 8 символов)" },
    ],
    response: `{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": {\n    "id": "string",\n    "name": "string",\n    "role": "string"\n  },\n  "expiresIn": 86400\n}`,
  },
  {
    method: "GET",
    path: "/api/v1/logs",
    description: "Получить системные логи",
    auth: true,
    roles: ["admin"],
    params: [
      { name: "level", type: "string", required: false, description: "INFO | WARN | ERROR | DEBUG" },
      { name: "service", type: "string", required: false, description: "Название сервиса" },
      { name: "from", type: "string", required: false, description: "Дата начала (ISO8601)" },
      { name: "to", type: "string", required: false, description: "Дата конца (ISO8601)" },
    ],
    response: `{\n  "logs": [\n    {\n      "id": "string",\n      "level": "INFO",\n      "service": "auth",\n      "message": "string",\n      "timestamp": "ISO8601",\n      "ip": "192.168.1.1"\n    }\n  ],\n  "total": 5420\n}`,
  },
  {
    method: "PUT",
    path: "/api/v1/users/:id/role",
    description: "Изменить роль пользователя",
    auth: true,
    roles: ["admin"],
    params: [
      { name: "id", type: "string", required: true, description: "UUID пользователя (path param)" },
      { name: "role", type: "string", required: true, description: "Новая роль: admin | manager | viewer" },
    ],
    response: `{\n  "success": true,\n  "user": {\n    "id": "string",\n    "role": "manager"\n  },\n  "updatedAt": "ISO8601"\n}`,
  },
  {
    method: "DELETE",
    path: "/api/v1/sessions/:id",
    description: "Завершить пользовательскую сессию",
    auth: true,
    roles: ["admin"],
    params: [
      { name: "id", type: "string", required: true, description: "ID сессии (path param)" },
    ],
    response: `{\n  "success": true,\n  "message": "Session terminated"\n}`,
  },
];

const METHOD_CONFIG: Record<string, { color: string; bg: string }> = {
  GET: { color: "#00FF88", bg: "rgba(0,255,136,0.12)" },
  POST: { color: "#00F5FF", bg: "rgba(0,245,255,0.12)" },
  PUT: { color: "#FF6B00", bg: "rgba(255,107,0,0.12)" },
  DELETE: { color: "#FF006E", bg: "rgba(255,0,110,0.12)" },
  PATCH: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

export default function ApiDocsSection() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="glass rounded-2xl p-5 border border-border flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,245,255,0.12)" }}>
          <Icon name="Globe" size={20} className="neon-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground mb-1">Base URL</h3>
          <div className="flex items-center gap-2">
            <code className="font-mono-code text-sm text-neon-cyan bg-secondary/50 px-3 py-1.5 rounded-lg">
              https://api.nexus.io/v1
            </code>
            <button
              onClick={() => copyText("https://api.nexus.io/v1", "base")}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={copied === "base" ? "Check" : "Copy"} size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Все запросы требуют заголовка <code className="font-mono-code text-neon-cyan">Authorization: Bearer &lt;token&gt;</code> (кроме помеченных)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ENDPOINTS.map((ep, i) => {
          const mc = METHOD_CONFIG[ep.method];
          const isOpen = expanded === i;
          return (
            <div key={i} className="glass rounded-2xl border border-border overflow-hidden transition-all duration-300">
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors text-left"
              >
                <span
                  className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-lg w-16 text-center flex-shrink-0"
                  style={{ color: mc.color, background: mc.bg }}
                >
                  {ep.method}
                </span>
                <code className="font-mono-code text-sm text-foreground flex-1">{ep.path}</code>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ep.auth && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon name="Lock" size={12} />
                    </span>
                  )}
                  {ep.roles.map((r) => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded font-mono-code"
                      style={{
                        color: r === "admin" ? "#FF006E" : r === "manager" ? "#00F5FF" : "#00FF88",
                        background: r === "admin" ? "rgba(255,0,110,0.1)" : r === "manager" ? "rgba(0,245,255,0.1)" : "rgba(0,255,136,0.1)",
                      }}>
                      {r}
                    </span>
                  ))}
                  <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 pb-4 pt-4 space-y-4 animate-fade-in">
                  <p className="text-sm text-muted-foreground">{ep.description}</p>

                  {ep.params.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                        Параметры
                      </p>
                      <div className="rounded-xl overflow-hidden border border-border">
                        {ep.params.map((p, j) => (
                          <div
                            key={j}
                            className={`flex items-start gap-4 px-4 py-3 text-sm ${j < ep.params.length - 1 ? "border-b border-border/50" : ""}`}
                          >
                            <code className="font-mono-code text-neon-cyan w-24 flex-shrink-0">{p.name}</code>
                            <span className="font-mono-code text-xs text-muted-foreground w-16 flex-shrink-0 mt-0.5">
                              {p.type}
                            </span>
                            <span className={`text-xs w-20 flex-shrink-0 mt-0.5 font-semibold ${p.required ? "text-red-400" : "text-muted-foreground"}`}>
                              {p.required ? "обязателен" : "опционально"}
                            </span>
                            <span className="text-muted-foreground text-xs flex-1">{p.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Ответ (200 OK)
                      </p>
                      <button
                        onClick={() => copyText(ep.response, `ep-${i}`)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon name={copied === `ep-${i}` ? "Check" : "Copy"} size={12} />
                        {copied === `ep-${i}` ? "Скопировано!" : "Копировать"}
                      </button>
                    </div>
                    <pre className="font-mono-code text-xs text-neon-cyan bg-secondary/30 border border-border rounded-xl p-4 overflow-x-auto">
                      {ep.response}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
