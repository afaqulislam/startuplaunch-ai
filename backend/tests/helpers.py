def register_and_login(client, email, password="supersecret123"):
    client.post("/api/auth/register", json={"email": email, "password": password})
    login = client.post("/api/auth/login", data={"username": email, "password": password})
    return login.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}
