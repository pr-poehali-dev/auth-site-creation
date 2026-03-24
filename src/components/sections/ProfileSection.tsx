import { useState } from "react";
import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface ProfileSectionProps {
  user: User;
}

const ROLE_PERMISSIONS: Record<string, { label: string; allowed: string[]; denied: string[] }> = {
  admin: {
    label: "Администратор",
    allowed: [
      "Просмотр всех разделов",
      "Управление пользователями",
      "Изменение ролей и прав",
      "Просмотр логов",
      "Настройка системы",
      "Доступ к API документации",
      "Управление сессиями",
    ],
    denied: [],
  },
  manager: {
    label: "Менеджер",
    allowed: [
      "Просмотр дашборда",
      "Просмотр логов",
      "Доступ к API документации",
      "Редактирование своего профиля",
    ],
    denied: [
      "Управление пользователями",
      "Изменение системных настроек",
      "Управление ролями",
    ],
  },
  viewer: {
    label: "Наблюдатель",
    allowed: [
      "Просмотр дашборда",
      "Редактирование своего профиля",
    ],
    denied: [
      "Просмотр логов",
      "Доступ к API документации",
      "Управление пользователями",
      "Изменение системных настроек",
    ],
  },
};

const ROLE_COLOR: Record<string, string> = {
  admin: "#FF006E",
  manager: "#00F5FF",
  viewer: "#00FF88",
};

const ACTIVITY = [
  { action: "Авторизация в системе", time: "10 минут назад", icon: "LogIn" },
  { action: "Просмотр логов (256 записей)", time: "2 часа назад", icon: "Terminal" },
  { action: "Изменение настроек профиля", time: "вчера, 15:30", icon: "Settings" },
  { action: "Экспорт данных API", time: "23 марта, 11:20", icon: "Download" },
];

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [notif, setNotif] = useState(true);

  const roleConfig = ROLE_PERMISSIONS[user.role];
  const roleColor = ROLE_COLOR[user.role];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="glass rounded-2xl p-6 border border-border">
        <div className="flex items-start gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold font-display flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}10)`,
              border: `2px solid ${roleColor}40`,
              color: roleColor,
            }}
          >
            {user.avatar}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/50 border border-border rounded-xl px-3 py-2 text-lg font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: `${roleColor}20`, color: roleColor }}
                >
                  Сохранить
                </button>
                <button onClick={() => { setName(user.name); setEditing(false); }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-display font-bold text-foreground">{name}</h2>
                <button onClick={() => setEditing(true)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
                  <Icon name="Pencil" size={14} />
                </button>
              </div>
            )}
            <p className="text-muted-foreground text-sm mb-3">{user.email}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${roleColor}15`, color: roleColor }}
              >
                <Icon name="Shield" size={12} />
                {roleConfig.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Clock" size={12} />
                Последний вход: {user.lastLogin}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Key" size={12} />
                ID: #{user.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="font-display font-semibold text-foreground tracking-wide mb-4 flex items-center gap-2">
            <Icon name="Shield" size={16} style={{ color: roleColor }} />
            ПРАВА ДОСТУПА
          </h3>
          <div className="space-y-2">
            {roleConfig.allowed.map((perm, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,255,136,0.15)" }}>
                  <Icon name="Check" size={10} style={{ color: "#00FF88" }} />
                </div>
                <span className="text-foreground">{perm}</span>
              </div>
            ))}
            {roleConfig.denied.map((perm, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,0,110,0.1)" }}>
                  <Icon name="X" size={10} style={{ color: "#FF006E" }} />
                </div>
                <span className="text-muted-foreground line-through">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 border border-border">
            <h3 className="font-display font-semibold text-foreground tracking-wide mb-4 flex items-center gap-2">
              <Icon name="Bell" size={16} className="neon-cyan" />
              УВЕДОМЛЕНИЯ
            </h3>
            <div className="space-y-3">
              {[
                { label: "Email-уведомления", sub: "Системные события и алерты", state: notif, set: setNotif },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.state)}
                    className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                    style={{
                      background: item.state ? `${roleColor}` : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                      style={{ left: item.state ? "calc(100% - 18px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-border">
            <h3 className="font-display font-semibold text-foreground tracking-wide mb-4 flex items-center gap-2">
              <Icon name="Activity" size={16} style={{ color: "#FF6B00" }} />
              АКТИВНОСТЬ
            </h3>
            <div className="space-y-3">
              {ACTIVITY.map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,107,0,0.12)" }}>
                    <Icon name={act.icon} size={13} style={{ color: "#FF6B00" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{act.action}</p>
                    <p className="text-xs text-muted-foreground">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
