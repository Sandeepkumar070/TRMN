import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "rms-users-v1";
const SESSION_KEY = "rms-session-v1";

export const PAGE_OPTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/", description: "Rack overview and live status." },
  { key: "tag-management", label: "Tag Management", path: "/tag-management", description: "Create, update and delete tag records." },
  { key: "tag-assignment", label: "Tag Assignment", path: "/tag-assignment", description: "Assign tags to rack positions." },
  { key: "tag-history", label: "Tag History", path: "/tag-history", description: "View latest tag activity and history." },
  { key: "settings", label: "Settings", path: "/settings", description: "Change appearance and theme settings." },
];

export const ROLE_PRESETS = {
  ADMIN: PAGE_OPTIONS.map((page) => page.key),
  USER: ["dashboard", "tag-history", "settings"],
};

function readUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseSession(value) {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" && Array.isArray(parsed.permissions)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function readSession() {
  return (
    parseSession(localStorage.getItem(SESSION_KEY)) ||
    parseSession(sessionStorage.getItem(SESSION_KEY))
  );
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readSession());

  const login = ({ username, password, remember = true }) => {
    const cleanUsername = username.trim().toLowerCase();
    const user = readUsers().find(
      (item) => item.username.toLowerCase() === cleanUsername && item.password === password
    );

    if (!user) {
      return { success: false, message: "Invalid username or password." };
    }

    const session = publicUser(user);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);

    const targetStorage = remember ? localStorage : sessionStorage;
    targetStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { success: true, user: session };
  };

  const register = ({ username, password, accessType, permissions }) => {
    const cleanUsername = username.trim();
    const role = accessType === "ADMIN" ? "ADMIN" : "USER";
    const cleanPermissions = PAGE_OPTIONS
      .map((page) => page.key)
      .filter((key) => permissions.includes(key));

    if (!cleanUsername) {
      return { success: false, message: "Username is required." };
    }

    if (cleanUsername.length < 3) {
      return { success: false, message: "Username must be at least 3 characters." };
    }

    if (password.length < 4) {
      return { success: false, message: "Password must be at least 4 characters." };
    }

    if (cleanPermissions.length === 0) {
      return { success: false, message: "Select at least one page access." };
    }

    const users = readUsers();
    const exists = users.some(
      (item) => item.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (exists) {
      return { success: false, message: "Username already exists." };
    }

    const user = {
      id: globalThis.crypto?.randomUUID?.() ?? `USER-${Date.now()}`,
      username: cleanUsername,
      password,
      accessType: role,
      permissions: cleanPermissions,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));

    const session = publicUser(user);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);

    return { success: true, user: session };
  };

  const resetPassword = ({ username, newPassword }) => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, message: "Enter your registered username." };
    }
    if (newPassword.length < 4) {
      return { success: false, message: "New password must be at least 4 characters." };
    }

    const users = readUsers();
    const index = users.findIndex((item) => item.username.toLowerCase() === cleanUsername);
    if (index < 0) {
      return { success: false, message: "Username was not found." };
    }

    const updated = [...users];
    updated[index] = { ...updated[index], password: newPassword, updatedAt: new Date().toISOString() };
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return { success: true, message: "Password updated. You can login now." };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  const hasAccess = (pageKey) => Boolean(currentUser?.permissions?.includes(pageKey));

  const firstAllowedPath = (user = currentUser) => {
    const first = PAGE_OPTIONS.find((page) => user?.permissions?.includes(page.key));
    return first?.path || "/login";
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      resetPassword,
      logout,
      hasAccess,
      firstAllowedPath,
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
