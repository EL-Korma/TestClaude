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
import { registerPushToken } from "../services/notifications";

const TOKEN_KEY = "twinfit_jwt";

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
  age?: number;
  gender?: string;
  profile?: {
    avatarEmoji?: string;
    avatarType?: string;
    bio?: string;
    heightCm?: number;
    weightKg?: number;
    activeBorderId?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  bootstrapped: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
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

  const fetchAndSetUser = async (token: string) => {
    const userProfile = await meApi.get();
    setState({
      user: userProfile as AuthUser,
      token,
      loading: false,
      error: null,
      bootstrapped: true,
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadToken();
        if (stored) {
          setToken(stored);
          await fetchAndSetUser(stored);
        } else {
          setState((s) => ({ ...s, bootstrapped: true }));
        }
      } catch {
        await clearToken();
        setToken(null);
        setState((s) => ({ ...s, bootstrapped: true }));
      }
    })();
  }, []);

  const applyAuth = async (res: AuthResponse) => {
    setToken(res.token);
    await storeToken(res.token);
    // Fetch full profile (including avatarEmoji, bio, etc.)
    try {
      await fetchAndSetUser(res.token);
    } catch {
      setState({
        user: res.user as AuthUser,
        token: res.token,
        loading: false,
        error: null,
        bootstrapped: true,
      });
    }
    // Register push token (non-blocking)
    registerPushToken().catch(() => {});
  };

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.login(email, password);
      await applyAuth(res);
    } catch (e: any) {
      const msg = e.message ?? "Login failed";
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.register(payload);
      await applyAuth(res);
    } catch (e: any) {
      const msg = e.message ?? "Registration failed";
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw new Error(msg);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = state.token;
    if (!currentToken) return;
    try {
      await fetchAndSetUser(currentToken);
    } catch {}
  }, [state.token]);

  const logout = useCallback(async () => {
    setToken(null);
    await clearToken();
    setState({ user: null, token: null, loading: false, error: null, bootstrapped: true });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
