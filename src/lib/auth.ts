export function storeLogin(token: string, user: { id: string; name: string; role: string }) {
  localStorage.setItem("token", token);
  localStorage.setItem("userId", user.id);
  localStorage.setItem("role", user.role);
  localStorage.setItem("userName", user.name);
}

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("userId");
  if (stored) return stored;
  // Fallback: extract from JWT sub field
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.id || "";
    } catch { /* ignore */ }
  }
  return "";
}

export function getRole(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("role") || "";
}

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userName") || "User";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
