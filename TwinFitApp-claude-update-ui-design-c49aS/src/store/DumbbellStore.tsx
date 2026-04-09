/**
 * TwinFit Dumbbell Economy
 * ──────────────────────────────────────────────────────────────
 * Dumbbells (🏋️) are the in-app currency.
 *
 * EARNING:
 *   • Complete daily quests   → 10–30 dumbbells each
 *   • Complete weekly quests  → 50–120 dumbbells each
 *   • Complete monthly quests → 200–500 dumbbells each
 *
 * SPENDING:
 *   • Buy dumbbell packs (bulk purchase from Shop)
 *   • Buy XP boosts (2× for 24 h, cost: 80 dumbbells)
 *   • Buy avatar borders (cost: 150–400 dumbbells)
 *
 * State syncs with the Express backend on mount and after every
 * earn/spend action when a user token is present.
 * ──────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { walletApi, questsApi, shopApi, boostsApi, meApi, getToken } from "../services/api";
import { useAuth } from "./AuthStore";

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuestFrequency = "daily" | "weekly" | "monthly";

export interface Quest {
  id: string;
  code: string;
  title: string;
  description: string;
  reward: number; // dumbbells
  xpReward: number;
  frequency: QuestFrequency;
  completed: boolean;
  progress: number; // 0–1
  icon: string;
}

export interface ShopPack {
  id: string;
  label: string;
  dumbbells: number;
  price: string; // display price
  bonus?: string;
  popular?: boolean;
}

export interface ShopBoost {
  id: string;
  label: string;
  description: string;
  cost: number;
  multiplier: number;
  durationHours: number;
  icon: string;
}

export interface ShopBorder {
  id: string;
  code: string;
  label: string;
  description: string;
  cost: number;
  rarity: "common" | "rare" | "legendary" | "mythic";
  color: string;
  /** Second color for gradient rings */
  color2?: string;
  icon: string;
}

export interface DumbbellState {
  balance: number;
  totalEarned: number;
  xp: number;
  xpMultiplier: number;
  xpBoostExpiresAt: number | null; // timestamp ms
  ownedBorders: string[]; // border codes
  activeBorder: string;
  quests: Quest[];
  lastDailyReset: string; // ISO date string
  synced: boolean; // true once first API load completes
}

// ─── Fallback quest catalogue (used before API loads) ────────────────────────

const FALLBACK_QUESTS: Quest[] = [
  { id: "d1", code: "d1", title: "First Rep", description: "Log a workout session", reward: 15, xpReward: 50, frequency: "daily", completed: false, progress: 0, icon: "💪" },
  { id: "d2", code: "d2", title: "Fuel Up", description: "Log your meal in Fuel tab", reward: 10, xpReward: 30, frequency: "daily", completed: false, progress: 0, icon: "🥗" },
  { id: "d3", code: "d3", title: "Hydration Hero", description: "Log 8 glasses of water", reward: 10, xpReward: 25, frequency: "daily", completed: false, progress: 0.5, icon: "💧" },
  { id: "d4", code: "d4", title: "Twin Check", description: "Both partners log today", reward: 20, xpReward: 75, frequency: "daily", completed: false, progress: 0, icon: "🔥" },
  { id: "d5", code: "d5", title: "Morning Mover", description: "Log a session before noon", reward: 15, xpReward: 40, frequency: "daily", completed: true, progress: 1, icon: "☀️" },
  { id: "w1", code: "w1", title: "5-Day Warrior", description: "Log sessions 5 days this week", reward: 80, xpReward: 300, frequency: "weekly", completed: false, progress: 0.6, icon: "⚔️" },
  { id: "w2", code: "w2", title: "Macro Master", description: "Hit protein goal 4 days this week", reward: 60, xpReward: 200, frequency: "weekly", completed: false, progress: 0.5, icon: "🥩" },
  { id: "w3", code: "w3", title: "Duo Dominance", description: "Complete 3 shared sessions", reward: 100, xpReward: 400, frequency: "weekly", completed: false, progress: 0.33, icon: "🤝" },
  { id: "w4", code: "w4", title: "Perfect Week", description: "Complete all daily quests 3 days", reward: 120, xpReward: 500, frequency: "weekly", completed: false, progress: 0.4, icon: "🌟" },
  { id: "m1", code: "m1", title: "Iron Consistency", description: "Log 20 sessions this month", reward: 350, xpReward: 1500, frequency: "monthly", completed: false, progress: 0.7, icon: "🏆" },
  { id: "m2", code: "m2", title: "Nutrition Ninja", description: "Hit all macros for 2 weeks", reward: 250, xpReward: 1000, frequency: "monthly", completed: false, progress: 0.4, icon: "🥷" },
  { id: "m3", code: "m3", title: "Streak Legend", description: "Maintain a 21-day streak", reward: 500, xpReward: 2000, frequency: "monthly", completed: false, progress: 0.67, icon: "💎" },
  { id: "m4", code: "m4", title: "Twin Flame", description: "Complete 12 duo sessions", reward: 300, xpReward: 1200, frequency: "monthly", completed: false, progress: 0.5, icon: "🔥" },
];

// ─── Shop catalogues ─────────────────────────────────────────────────────────

export const SHOP_PACKS: ShopPack[] = [
  { id: "p1", label: "Starter Pack", dumbbells: 50, price: "$0.99" },
  { id: "p2", label: "Gym Bag", dumbbells: 150, price: "$2.49", bonus: "+20 bonus" },
  { id: "p3", label: "Iron Stash", dumbbells: 350, price: "$4.99", bonus: "+50 bonus", popular: true },
  { id: "p4", label: "Beast Mode", dumbbells: 800, price: "$9.99", bonus: "+150 bonus" },
  { id: "p5", label: "Legend Vault", dumbbells: 2000, price: "$19.99", bonus: "+500 bonus" },
];

export const SHOP_BOOSTS: ShopBoost[] = [
  { id: "b1", label: "XP Rush", description: "2× XP for 24 hours", cost: 80, multiplier: 2, durationHours: 24, icon: "⚡" },
  { id: "b2", label: "XP Surge", description: "3× XP for 6 hours — peak grind", cost: 150, multiplier: 3, durationHours: 6, icon: "🚀" },
  { id: "b3", label: "Weekend Blaze", description: "2× XP all weekend (48 h)", cost: 140, multiplier: 2, durationHours: 48, icon: "🔥" },
];

export const SHOP_BORDERS: ShopBorder[] = [
  { id: "br0",  code: "br0",  label: "None",           description: "Clean slate. Let your results do the talking.",                    cost: 0,    rarity: "common",    color: "transparent",  icon: "○" },
  { id: "br1",  code: "br1",  label: "Iron Ring",       description: "Forged in the gym. Cold, hard iron never lies.",                  cost: 150,  rarity: "common",    color: "#8A8A8A",      icon: "⬜" },
  { id: "br2",  code: "br2",  label: "Steel Pulse",     description: "A brushed-steel ring that hums with quiet confidence.",           cost: 200,  rarity: "common",    color: "#A8C0CC",      icon: "🔘" },
  { id: "br3",  code: "br3",  label: "Midnight Blue",   description: "Deep ocean calm. Train in the dark, shine in the light.",         cost: 220,  rarity: "common",    color: "#1E3A8A",      icon: "🔵" },
  { id: "br4",  code: "br4",  label: "Ember",           description: "Orange flame ring. Every rep is a spark.",                        cost: 350,  rarity: "rare",      color: "#FF5E1A",     color2: "#FF8C42", icon: "🔶" },
  { id: "br5",  code: "br5",  label: "Toxic Neon",      description: "Radioactive green glow. Gains so big they're illegal.",           cost: 400,  rarity: "rare",      color: "#39FF14",     color2: "#00FF7F", icon: "🟢" },
  { id: "br6",  code: "br6",  label: "Crimson Blade",   description: "Blood red edge. Warriors only. No excuses.",                      cost: 420,  rarity: "rare",      color: "#DC143C",     color2: "#FF4560", icon: "🔴" },
  { id: "br7",  code: "br7",  label: "Gold Rush",       description: "Shining gold. For those who never settle for silver.",            cost: 500,  rarity: "rare",      color: "#FFD700",     color2: "#FFA500", icon: "🟡" },
  { id: "br8",  code: "br8",  label: "Violet Storm",    description: "Electric purple ring. Unleash the beast within.",                 cost: 480,  rarity: "rare",      color: "#8B5CF6",     color2: "#C084FC", icon: "🟣" },
  { id: "br9",  code: "br9",  label: "Obsidian Void",   description: "Swallows light. Only the most disciplined wear the void.",        cost: 700,  rarity: "legendary", color: "#0D0D1A",     color2: "#FF5E1A", icon: "🖤" },
  { id: "br10", code: "br10", label: "Inferno Crown",   description: "Living fire border. Your dedication literally burns.",            cost: 900,  rarity: "legendary", color: "#FF2200",     color2: "#FF8800", icon: "👑" },
  { id: "br11", code: "br11", label: "Glacial Titan",   description: "Frozen tundra ring. Cold-blooded consistency.",                  cost: 850,  rarity: "legendary", color: "#00D4FF",     color2: "#FFFFFF", icon: "🧊" },
  { id: "br12", code: "br12", label: "Shadow Wraith",   description: "Invisible in the shadows. Unstoppable in the light.",             cost: 950,  rarity: "legendary", color: "#2D1B69",     color2: "#9333EA", icon: "👤" },
  { id: "br13", code: "br13", label: "Twin Flame",      description: "Two souls, one fire. Exclusive to duo legends only.",             cost: 1500, rarity: "mythic",    color: "#FF5E1A",     color2: "#A855F7", icon: "🔥" },
  { id: "br14", code: "br14", label: "Celestial Arc",   description: "Born from dying stars. Reserved for the truly elite.",            cost: 2000, rarity: "mythic",    color: "#FFD700",     color2: "#00D4FF", icon: "🌟" },
  { id: "br15", code: "br15", label: "Apex Sovereign",  description: "The highest rank. No one climbs higher than this.",               cost: 3000, rarity: "mythic",    color: "#FF2200",     color2: "#FFD700", icon: "⚡" },
];

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "EARN"; amount: number }
  | { type: "SPEND"; amount: number }
  | { type: "COMPLETE_QUEST"; code: string }
  | { type: "ACTIVATE_BOOST"; boost: ShopBoost }
  | { type: "PURCHASE_BORDER"; code: string }
  | { type: "SET_BORDER"; code: string }
  | { type: "SYNC_WALLET"; balance: number; totalEarned: number; xp: number }
  | { type: "SYNC_QUESTS"; quests: Quest[] }
  | { type: "SYNC_BORDERS"; ownedCodes: string[] };

const initial: DumbbellState = {
  balance: 0,
  totalEarned: 0,
  xp: 0,
  xpMultiplier: 1,
  xpBoostExpiresAt: null,
  ownedBorders: ["br0"],
  activeBorder: "br0",
  quests: FALLBACK_QUESTS,
  lastDailyReset: new Date().toISOString().split("T")[0],
  synced: false,
};

function reducer(state: DumbbellState, action: Action): DumbbellState {
  switch (action.type) {
    case "EARN":
      return { ...state, balance: state.balance + action.amount, totalEarned: state.totalEarned + action.amount };
    case "SPEND":
      return { ...state, balance: Math.max(0, state.balance - action.amount) };
    case "COMPLETE_QUEST": {
      const quest = state.quests.find((q) => q.code === action.code);
      if (!quest || quest.completed) return state;
      return {
        ...state,
        balance: state.balance + quest.reward,
        totalEarned: state.totalEarned + quest.reward,
        quests: state.quests.map((q) =>
          q.code === action.code ? { ...q, completed: true, progress: 1 } : q
        ),
      };
    }
    case "ACTIVATE_BOOST": {
      const expiresAt = Date.now() + action.boost.durationHours * 3600 * 1000;
      return {
        ...state,
        balance: state.balance - action.boost.cost,
        xpMultiplier: action.boost.multiplier,
        xpBoostExpiresAt: expiresAt,
      };
    }
    case "PURCHASE_BORDER":
      return {
        ...state,
        balance: state.balance - (SHOP_BORDERS.find((b) => b.code === action.code)?.cost ?? 0),
        ownedBorders: [...state.ownedBorders, action.code],
      };
    case "SET_BORDER":
      return { ...state, activeBorder: action.code };
    case "SYNC_WALLET":
      return {
        ...state,
        balance: action.balance,
        totalEarned: action.totalEarned,
        xp: action.xp,
        synced: true,
      };
    case "SYNC_QUESTS":
      return { ...state, quests: action.quests };
    case "SYNC_BORDERS":
      return { ...state, ownedBorders: action.ownedCodes };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface DumbbellContextValue {
  state: DumbbellState;
  earn: (amount: number) => void;
  spend: (amount: number) => boolean;
  completeQuest: (code: string) => Promise<void>;
  activateBoost: (boost: ShopBoost) => Promise<boolean>;
  purchaseBorder: (code: string) => Promise<boolean>;
  setBorder: (code: string) => void;
  isBoostActive: () => boolean;
  refreshWallet: () => Promise<void>;
}

const DumbbellContext = createContext<DumbbellContextValue | null>(null);

export const DumbbellProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  const { token } = useAuth();

  // ── Sync from API whenever the auth token changes ────────────────────────
  const refreshWallet = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [wallet, questProgress, borders] = await Promise.all([
        walletApi.get(),
        questsApi.list(),
        shopApi.borders(),
      ]);

      dispatch({ type: "SYNC_WALLET", balance: wallet.balance, totalEarned: wallet.totalEarned, xp: wallet.xp });

      const mappedQuests: Quest[] = questProgress.map((qp) => ({
        id: qp.quest.id,
        code: qp.quest.code,
        title: qp.quest.title,
        description: qp.quest.description,
        reward: qp.quest.reward,
        xpReward: qp.quest.xpReward,
        frequency: qp.quest.frequency.toLowerCase() as QuestFrequency,
        completed: qp.completed,
        progress: qp.progress,
        icon: qp.quest.icon,
      }));
      dispatch({ type: "SYNC_QUESTS", quests: mappedQuests });

      const ownedCodes = borders.filter((b) => b.owned).map((b) => b.code);
      if (!ownedCodes.includes("br0")) ownedCodes.unshift("br0");
      dispatch({ type: "SYNC_BORDERS", ownedCodes });
    } catch {
      // silently fall back to local state
    }
  }, []);

  // Re-sync every time auth token arrives or changes
  useEffect(() => {
    if (token) refreshWallet();
  }, [token, refreshWallet]);

  const isBoostActive = () =>
    state.xpBoostExpiresAt !== null && Date.now() < state.xpBoostExpiresAt;

  const earn = (amount: number) => dispatch({ type: "EARN", amount });

  const spend = (amount: number): boolean => {
    if (state.balance < amount) return false;
    dispatch({ type: "SPEND", amount });
    return true;
  };

  const completeQuest = async (code: string) => {
    dispatch({ type: "COMPLETE_QUEST", code });
    if (getToken()) {
      try {
        const result = await questsApi.claim(code);
        // Sync the authoritative balance back
        dispatch({ type: "SYNC_WALLET", balance: result.balance, totalEarned: state.totalEarned, xp: result.xp });
      } catch {
        // optimistic update already applied
      }
    }
  };

  const activateBoost = async (boost: ShopBoost): Promise<boolean> => {
    if (state.balance < boost.cost) return false;
    dispatch({ type: "ACTIVATE_BOOST", boost });
    if (getToken()) {
      try {
        await boostsApi.activate(boost.multiplier, boost.durationHours, boost.cost);
        await refreshWallet();
      } catch {
        // optimistic update already applied
      }
    }
    return true;
  };

  const purchaseBorder = async (code: string): Promise<boolean> => {
    const border = SHOP_BORDERS.find((b) => b.code === code);
    if (!border || state.balance < border.cost || state.ownedBorders.includes(code)) return false;
    dispatch({ type: "PURCHASE_BORDER", code });
    if (getToken()) {
      try {
        const result = await shopApi.buyBorder(code);
        dispatch({ type: "SYNC_WALLET", balance: result.balance, totalEarned: state.totalEarned, xp: state.xp });
        await refreshWallet();
      } catch {
        // optimistic update already applied
      }
    }
    return true;
  };

  const setBorder = (code: string) => {
    dispatch({ type: "SET_BORDER", code });
    if (getToken()) {
      // find border db id for API call — use code as identifier
      shopApi.borders().then((borders) => {
        const border = borders.find((b) => b.code === code);
        if (border) {
          // Update active border on profile via me API
          meApi.setActiveBorder(border.id).catch(() => {});
        }
      }).catch(() => {});
    }
  };

  return (
    <DumbbellContext.Provider
      value={{ state, earn, spend, completeQuest, activateBoost, purchaseBorder, setBorder, isBoostActive, refreshWallet }}
    >
      {children}
    </DumbbellContext.Provider>
  );
};

export const useDumbbells = () => {
  const ctx = useContext(DumbbellContext);
  if (!ctx) throw new Error("useDumbbells must be used inside DumbbellProvider");
  return ctx;
};
