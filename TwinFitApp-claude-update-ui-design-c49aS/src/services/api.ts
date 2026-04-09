/**
 * TwinFit API Client
 * Reads EXPO_PUBLIC_API_URL from environment (set in .env).
 * Dev: http://localhost:4000/api
 * Prod: https://your-app.vercel.app/api
 */
import Constants from "expo-constants";

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:4000/api";

// ─── Token store (in-memory) ─────────────────────────────────────────────────
// For production use expo-secure-store for persistence across restarts.
let _token: string | null = null;

export const setToken = (token: string | null) => { _token = token; };
export const getToken = () => _token;

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach Bearer token (default true)
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth && _token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try { message = JSON.parse(text).error ?? text; } catch {}
    throw new ApiError(res.status, message || `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  age?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    surname: string;
  };
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: payload, auth: false }),

  // Server accepts `identifier` (email or username or phone) + password
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: { identifier: email, password }, auth: false }),
};

// ─── Me / Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
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

export const meApi = {
  get: () => apiFetch<{ user: UserProfile }>("/me").then((r) => r.user),

  updateProfile: (data: {
    avatarEmoji?: string;
    bio?: string;
    heightCm?: number;
    weightKg?: number;
    activeBorderId?: string;
  }) => apiFetch("/me/profile", { method: "PATCH", body: data }),

  setActiveBorder: (borderId: string) =>
    apiFetch("/me/border", { method: "PATCH", body: { borderId } }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch("/me/password", { method: "PATCH", body: { currentPassword, newPassword } }),
};

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface Wallet {
  balance: number;
  totalEarned: number;
  xp: number;
}

export const walletApi = {
  get: () => apiFetch<{ wallet: Wallet }>("/wallet").then((r) => r.wallet),
  transactions: () =>
    apiFetch<{ transactions: { id: string; amount: number; reason: string; balanceAfter: number; createdAt: string }[] }>("/wallet/transactions")
      .then((r) => r.transactions),
};

// ─── Quests ──────────────────────────────────────────────────────────────────

export interface QuestDef {
  id: string;
  code: string;
  title: string;
  description: string;
  reward: number;
  xpReward: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  icon: string;
}

export interface QuestProgress {
  quest: QuestDef;
  progress: number;   // 0–1
  completed: boolean;
  claimedAt: string | null;
  periodKey: string;
}

// Shape returned by GET /quests: { quests: [...] }
// Each item: { ...questFields, userProgress: { progress, completed, claimedAt, periodKey } | null }
interface QuestWithProgress {
  id: string;
  code: string;
  title: string;
  description: string;
  reward: number;
  xpReward: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  icon: string;
  userProgress: { progress: number; completed: boolean; claimedAt: string | null; periodKey: string } | null;
}

export const questsApi = {
  list: (): Promise<QuestProgress[]> =>
    apiFetch<{ quests: QuestWithProgress[] }>("/quests").then((r) =>
      r.quests.map((q) => ({
        quest: { id: q.id, code: q.code, title: q.title, description: q.description, reward: q.reward, xpReward: q.xpReward, frequency: q.frequency, icon: q.icon },
        progress: q.userProgress?.progress ?? 0,
        completed: q.userProgress?.completed ?? false,
        claimedAt: q.userProgress?.claimedAt ?? null,
        periodKey: q.userProgress?.periodKey ?? "",
      }))
    ),
  claim: (code: string) =>
    apiFetch<{ wallet: { balance: number; xp: number } }>(`/quests/${code}/claim`, { method: "POST" })
      .then((r) => ({ balance: r.wallet.balance, xp: r.wallet.xp })),
};

// ─── Shop / Borders ──────────────────────────────────────────────────────────

export interface BorderDef {
  id: string;
  code: string;
  label: string;
  description: string;
  cost: number;
  rarity: "COMMON" | "RARE" | "LEGENDARY" | "MYTHIC";
  color: string;
  color2?: string;
  icon: string;
  owned: boolean;
}

export const shopApi = {
  borders: () =>
    apiFetch<{ borders: BorderDef[] }>("/shop/borders").then((r) => r.borders),
  buyBorder: (code: string) =>
    apiFetch<{ wallet: { balance: number } }>(`/shop/borders/${code}/buy`, { method: "POST" })
      .then((r) => ({ balance: r.wallet.balance })),
};

// ─── Boosts ──────────────────────────────────────────────────────────────────

export interface BoostRecord {
  id: string;
  multiplier: number;
  expiresAt: string;
}

export const boostsApi = {
  activate: (multiplier: number, durationHours: number, cost: number) =>
    apiFetch<{ boost: BoostRecord }>("/boosts", {
      method: "POST",
      body: { multiplier, durationHours, cost },
    }).then((r) => r.boost),
};

// ─── Streaks ─────────────────────────────────────────────────────────────────

export interface StreakData {
  id: string;
  current: number;
  longest: number;
  weeklyCount: number;
  level: number;
  lastLogDate: string | null;
}

export const streaksApi = {
  me: () =>
    apiFetch<{ streak: StreakData | null }>("/streaks/me").then((r) => r.streak),
  group: (groupId: string) =>
    apiFetch<{ streak: StreakData | null }>(`/streaks/group/${groupId}`).then((r) => r.streak),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () =>
    apiFetch<{ notifications: NotificationItem[] }>("/notifications").then((r) => r.notifications),
  markRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch("/notifications/read-all", { method: "PATCH" }),
};

// ─── Check-ins ────────────────────────────────────────────────────────────────

export const checkInsApi = {
  create: (groupId: string, photoUrl: string) =>
    apiFetch("/checkins", { method: "POST", body: { groupId, photoUrl, capturedAt: new Date().toISOString() } }),
  mine: () =>
    apiFetch<{ checkins: { id: string; photoUrl: string; status: string; capturedAt: string }[] }>("/checkins/me")
      .then((r) => r.checkins),
};

// ─── Groups ──────────────────────────────────────────────────────────────────

export interface GroupMember {
  id: string;
  userId: string;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    profile?: { avatarEmoji?: string; bio?: string };
  };
}

export interface Group {
  id: string;
  name: string;
  mode: string;
  inviteCode: string;
  members: GroupMember[];
}

export const groupsApi = {
  mine: () =>
    apiFetch<{ groups: Group[] }>("/me/groups").then((r) => r.groups),
  get: (id: string) =>
    apiFetch<{ group: Group }>(`/groups/${id}`).then((r) => r.group),
  create: (name: string, mode: string) =>
    apiFetch<{ group: Group }>("/groups", { method: "POST", body: { name, mode } }).then((r) => r.group),
  join: (inviteCode: string) =>
    apiFetch<{ group: Group }>("/groups/join", { method: "POST", body: { inviteCode } }).then((r) => r.group),
  leave: (id: string) =>
    apiFetch(`/groups/${id}/leave`, { method: "DELETE" }),
};

// ─── Meal Scans ──────────────────────────────────────────────────────────────

export interface MealScanRecord {
  id: string;
  description: string;
  photoUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore?: number;
  scannedAt: string;
}

export const mealScansApi = {
  list: () =>
    apiFetch<{ scans: MealScanRecord[] }>("/meal-scans").then((r) => r.scans),
  save: (data: Omit<MealScanRecord, "id" | "scannedAt">) =>
    apiFetch<{ scan: MealScanRecord }>("/meal-scans", { method: "POST", body: data }).then((r) => r.scan),
};

// ─── AI ──────────────────────────────────────────────────────────────────────

export const aiApi = {
  recipe: (ingredients: string[], goal: string) =>
    apiFetch<{ recipe: any }>("/ai/recipe", { method: "POST", body: { ingredients, goal } })
      .then((r) => r.recipe),
  mealScan: (description: string) =>
    apiFetch<{ scan: any }>("/ai/meal-scan", { method: "POST", body: { description } })
      .then((r) => r.scan),
};

// ─── Recipes ─────────────────────────────────────────────────────────────────

export interface RecipeRecord {
  id: string;
  name: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal?: string;
  saved: boolean;
  createdAt: string;
}

export const recipesApi = {
  list: () =>
    apiFetch<{ recipes: RecipeRecord[] }>("/recipes").then((r) => r.recipes),
  save: (data: Omit<RecipeRecord, "id" | "saved" | "createdAt">) =>
    apiFetch<{ recipe: RecipeRecord }>("/recipes", { method: "POST", body: data }).then((r) => r.recipe),
};
