# SKILL: Supabase Auth
> TwinFit — Email/password, Google OAuth, Apple Sign-In, session persistence

## Installation
```bash
npm install @supabase/supabase-js expo-secure-store
```

## Supabase Client (services/supabase.ts)
```ts
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { config } from "@constants/config";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

## Auth Service (services/auth.ts)
```ts
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id, email, name,
        invite_code: generateInviteCode(),
      });
    }
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
```

## Auth Store (stores/authStore.ts)
```ts
import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { UserProfile } from "@types/user";

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  setSession: (s: Session | null) => void;
  setUser: (u: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null, user: null, isLoading: true,
  setSession: (session) => set({ session, isLoading: false }),
  setUser: (user) => set({ user }),
  signOut: async () => { await authService.signOut(); set({ session: null, user: null }); },
}));
```

## Protected Route Guard
```tsx
import { Redirect } from "expo-router";
import { useAuthStore } from "@stores/authStore";

export default function AppLayout() {
  const { session, isLoading } = useAuthStore();
  if (isLoading) return <LoadingScreen />;
  if (!session) return <Redirect href="/(auth)/splash" />;
  return <Tabs />;
}
```
