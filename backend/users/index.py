"""
CRUD пользователей NexusOS (только для admin).
GET / — список всех пользователей.
PUT /:id/role — изменить роль.
PUT /:id/status — изменить статус.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    }


def get_user_from_token(cur, token: str):
    if not token:
        return None
    cur.execute(
        """SELECT u.id, u.role FROM sessions s JOIN users u ON s.user_id = u.id
           WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers") or {}
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        auth_user = get_user_from_token(cur, token)
        if not auth_user:
            return {
                "statusCode": 401,
                "headers": {**cors_headers(), "Content-Type": "application/json"},
                "body": json.dumps({"error": "Необходима авторизация"}),
            }

        auth_id, auth_role = auth_user

        if method == "GET":
            cur.execute(
                """SELECT id, name, email, role, status, avatar, created_at, last_login
                   FROM users ORDER BY created_at ASC"""
            )
            rows = cur.fetchall()
            users = []
            for row in rows:
                uid, name, email, role, status, avatar, created_at, last_login = row
                users.append({
                    "id": str(uid),
                    "name": name,
                    "email": email,
                    "role": role,
                    "status": status,
                    "avatar": avatar,
                    "created": created_at.strftime("%d.%m.%Y") if created_at else None,
                    "lastLogin": last_login.isoformat() if last_login else None,
                })
            return {
                "statusCode": 200,
                "headers": {**cors_headers(), "Content-Type": "application/json"},
                "body": json.dumps({"users": users, "total": len(users)}),
            }

        if method == "PUT":
            if auth_role != "admin":
                return {
                    "statusCode": 403,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"error": "Недостаточно прав"}),
                }

            body = json.loads(event.get("body") or "{}")

            if "/role" in path:
                parts = path.strip("/").split("/")
                user_id = parts[-2] if len(parts) >= 2 else None
                new_role = body.get("role")
                if not new_role or new_role not in ("admin", "manager", "viewer"):
                    return {
                        "statusCode": 400,
                        "headers": {**cors_headers(), "Content-Type": "application/json"},
                        "body": json.dumps({"error": "Неверная роль"}),
                    }
                cur.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, user_id))
                conn.commit()
                return {
                    "statusCode": 200,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"success": True, "role": new_role}),
                }

            if "/status" in path:
                parts = path.strip("/").split("/")
                user_id = parts[-2] if len(parts) >= 2 else None
                new_status = body.get("status")
                if not new_status or new_status not in ("active", "suspended"):
                    return {
                        "statusCode": 400,
                        "headers": {**cors_headers(), "Content-Type": "application/json"},
                        "body": json.dumps({"error": "Неверный статус"}),
                    }
                cur.execute("UPDATE users SET status = %s WHERE id = %s", (new_status, user_id))
                conn.commit()
                return {
                    "statusCode": 200,
                    "headers": {**cors_headers(), "Content-Type": "application/json"},
                    "body": json.dumps({"success": True, "status": new_status}),
                }

        return {"statusCode": 404, "headers": cors_headers(), "body": ""}

    finally:
        cur.close()
        conn.close()
