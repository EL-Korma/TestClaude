import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { authApi, setToken, type AuthResponse, type RegisterPayload, meApi } from "../services/api";

const TOKEN_KEY = "twinfit_jwt";

// SecureStore doesn't work on web — fall back to localStorage
const storeToken = async (token: string) => {
  try { await SecureStore.setItemAsync(TOKEN_KEY, token); } catch {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  }
};
const loadToken = async (): Promise<string | null> => {
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }
};
const clearToken = async () => {
  try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  }
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  surname: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  bootstrapped: boolean; // true once we've checked SecureStore
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
    bootstrapped: false,
  });

  // ── Restore session on app launch ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await loadToken();
        if (stored) {
          setToken(stored);
          // Verify token is still valid by fetching /me
          const userProfile = await meApi.get();
          setState({ user: userProfile as AuthUser, token: stored, loading: false, error: null, bootstrapped: true });
        } else {
          setState((s) => ({ ...s, bootstrapped: true }));
        }
      } catch {
        // Token expired or invalid — clear it
        await clearToken();
        setToken(null);
        setState((s) => ({ ...s, bootstrapped: true }));
      }
    })();
  }, []);

  const applyAuth = async (res: AuthResponse) => {
    setToken(res.token);
    await storeToken(res.token);
    setState({
      user: res.user,
      token: res.token,
      loading: false,
      error: null,
      bootstrapped: true,
    });
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.login(email, password);
      await applyAuth(res);
      return true;
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message ?? "Login failed" }));
      return false;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.register(payload);
      await applyAuth(res);
      return true;
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message ?? "Registration failed" }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    await clearToken();
    setState({ user: null, token: null, loading: false, error: null, bootstrapped: true });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
