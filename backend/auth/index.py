"""
Авторизация пользователей NexusOS.
POST /login — вход по email+password, возвращает токен сессии и данные юзера.
POST /logout — завершение сессии.
GET / — проверка токена (X-Auth-Token).
"""
import json
import os
import uuid
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def check_password(password: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_password(password), stored_hash)


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "POST" and path.endswith("/login"):
            body = json.loads(event.get("body") or "{}")
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")

            cur.execute(
                "SELECT id, name, email, password_hash, role, avatar, status FROM users WHERE email = %s",
                (email,)
            )
            row = cur.fetchone()

            if not row:
                return {
                    "statusCode": 401,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Неверный email или пароль"}),
                }

            user_id, name, user_email, password_hash, role, avatar, status = row

            if status == "suspended":
                return {
                    "statusCode": 403,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Аккаунт заблокирован"}),
                }

            if not check_password(password, password_hash):
                cur.execute(
                    "INSERT INTO system_logs (level, service, message, ip_address) VALUES (%s, %s, %s, %s)",
                    ("WARN", "auth", f"Неудачная попытка входа: {email}", ip)
                )
                conn.commit()
                return {
                    "statusCode": 401,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Неверный email или пароль"}),
                }

            token = str(uuid.uuid4()).replace("-", "")
            expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

            cur.execute(
                "INSERT INTO sessions (user_id, token, ip_address, expires_at) VALUES (%s, %s, %s, %s)",
                (str(user_id), token, ip, expires_at)
            )

            cur.execute(
                "UPDATE users SET last_login = NOW() WHERE id = %s",
                (str(user_id),)
            )

            cur.execute(
                "INSERT INTO system_logs (level, service, message, user_id, ip_address) VALUES (%s, %s, %s, %s, %s)",
                ("INFO", "auth", f"Успешная авторизация: {email}", str(user_id), ip)
            )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": {**cors_headers(), "Content-Type": "application/json"},
                "body": json.dumps({
                    "token": token,
                    "user": {
                        "id": str(user_id),
                        "name": name,
                        "email": user_email,
                        "role": role,
                        "avatar": avatar,
                        "lastLogin": expires_at.isoformat(),
                    }
                }),
            }

        elif method == "POST" and path.endswith("/logout"):
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token", "")
            if token:
                cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return {
                "statusCode": 200,
                "headers": {**cors_headers(), "Content-Type": "application/json"},
                "body": json.dumps({"success": True}),
            }

        elif method == "GET":
            token = headers.get("x-auth-token") or headers.get("X-Auth-Token", "")
            if not token:
                return {
                    "statusCode": 401,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Токен не передан"}),
                }

            cur.execute(
                """SELECT u.id, u.name, u.email, u.role, u.avatar, u.last_login
                   FROM sessions s JOIN users u ON s.user_id = u.id
                   WHERE s.token = %s AND s.expires_at > NOW()""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {
                    "statusCode": 401,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Сессия недействительна"}),
                }

            uid, name, email, role, avatar, last_login = row
            return {
                "statusCode": 200,
                "headers": {**cors_headers(), "Content-Type": "application/json"},
                "body": json.dumps({
                    "user": {
                        "id": str(uid),
                        "name": name,
                        "email": email,
                        "role": role,
                        "avatar": avatar,
                        "lastLogin": last_login.isoformat() if last_login else None,
                    }
                }),
            }

        return {"statusCode": 404, "headers": cors_headers(), "body": ""}
    finally:
        cur.close()
        conn.close()
