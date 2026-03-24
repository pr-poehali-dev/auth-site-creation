"""
Начальное заполнение БД тестовыми данными (вызвать один раз).
GET / — создаёт пользователей если их нет.
"""
import json
import os
import hashlib
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }


SEED_USERS = [
    ("Алексей Громов", "admin@nexus.io", "admin123", "admin", "АГ", "active"),
    ("Мария Соколова", "manager@nexus.io", "manager123", "manager", "МС", "active"),
    ("Иван Петров", "viewer@nexus.io", "viewer123", "viewer", "ИП", "active"),
    ("Дарья Кузнецова", "daria@nexus.io", "manager123", "manager", "ДК", "suspended"),
]

SEED_LOGS = [
    ("INFO", "auth", "Пользователь admin@nexus.io успешно авторизован", "192.168.1.1"),
    ("WARN", "api", "Превышен лимит запросов: 1000/мин для IP 192.168.1.45", "192.168.1.45"),
    ("ERROR", "db", "Connection timeout after 30s: PostgreSQL host unreachable", "10.0.0.5"),
    ("DEBUG", "api", "GET /api/v1/users?page=1&limit=50 -> 200 OK [42ms]", "192.168.1.22"),
    ("INFO", "deploy", "Развёртывание v2.4.1 завершено успешно", "10.0.0.1"),
    ("INFO", "auth", "Создана новая сессия: lifetime=24h", "192.168.1.3"),
    ("ERROR", "mail", "SMTP error: Connection refused to smtp.nexus.io:587", "10.0.0.8"),
    ("WARN", "cache", "Redis memory usage at 85% capacity", "10.0.0.9"),
    ("DEBUG", "api", "POST /api/v1/auth/login -> 401 Unauthorized [12ms]", "192.168.1.99"),
    ("INFO", "cron", "Плановая задача backup запущена", "10.0.0.1"),
    ("INFO", "api", "GET /api/v1/sessions -> 200 OK [8ms]", "192.168.1.7"),
    ("WARN", "auth", "Неудачная попытка входа: 3/5 для user@nexus.io", "192.168.1.45"),
]


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    conn = get_conn()
    cur = conn.cursor()

    try:
        created_users = 0
        for name, email, password, role, avatar, status in SEED_USERS:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO users (name, email, password_hash, role, avatar, status) VALUES (%s, %s, %s, %s, %s, %s)",
                    (name, email, hash_password(password), role, avatar, status)
                )
                created_users += 1

        cur.execute("SELECT COUNT(*) FROM system_logs")
        log_count = cur.fetchone()[0]
        created_logs = 0
        if log_count == 0:
            for level, service, message, ip in SEED_LOGS:
                cur.execute(
                    "INSERT INTO system_logs (level, service, message, ip_address) VALUES (%s, %s, %s, %s)",
                    (level, service, message, ip)
                )
                created_logs += 1

        conn.commit()

        return {
            "statusCode": 200,
            "headers": {**cors_headers(), "Content-Type": "application/json"},
            "body": json.dumps({
                "success": True,
                "created_users": created_users,
                "created_logs": created_logs,
                "message": "Seed завершён"
            }),
        }
    finally:
        cur.close()
        conn.close()
