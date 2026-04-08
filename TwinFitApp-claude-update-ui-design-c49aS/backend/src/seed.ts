import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createId } from "@paralleldrive/cuid2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter }) as any;

async function main() {
  console.log("🌱 Seeding quests...");
  const quests = [
    { code: "d1", title: "First Rep", description: "Log a workout session", reward: 15, xpReward: 50, frequency: "DAILY", icon: "💪" },
    { code: "d2", title: "Fuel Up", description: "Log your meal in Fuel tab", reward: 10, xpReward: 30, frequency: "DAILY", icon: "🥗" },
    { code: "d3", title: "Hydration Hero", description: "Log 8 glasses of water", reward: 10, xpReward: 25, frequency: "DAILY", icon: "💧" },
    { code: "d4", title: "Twin Check", description: "Both partners log today", reward: 20, xpReward: 75, frequency: "DAILY", icon: "🔥" },
    { code: "d5", title: "Morning Mover", description: "Log a session before noon", reward: 15, xpReward: 40, frequency: "DAILY", icon: "☀️" },
    { code: "w1", title: "5-Day Warrior", description: "Log sessions 5 days this week", reward: 80, xpReward: 300, frequency: "WEEKLY", icon: "⚔️" },
    { code: "w2", title: "Macro Master", description: "Hit protein goal 4 days this week", reward: 60, xpReward: 200, frequency: "WEEKLY", icon: "🥩" },
    { code: "w3", title: "Duo Dominance", description: "Complete 3 shared sessions", reward: 100, xpReward: 400, frequency: "WEEKLY", icon: "🤝" },
    { code: "w4", title: "Perfect Week", description: "Complete all daily quests 3 days", reward: 120, xpReward: 500, frequency: "WEEKLY", icon: "🌟" },
    { code: "m1", title: "Iron Consistency", description: "Log 20 sessions this month", reward: 350, xpReward: 1500, frequency: "MONTHLY", icon: "🏆" },
    { code: "m2", title: "Nutrition Ninja", description: "Hit all macros for 2 weeks", reward: 250, xpReward: 1000, frequency: "MONTHLY", icon: "🥷" },
    { code: "m3", title: "Streak Legend", description: "Maintain a 21-day streak", reward: 500, xpReward: 2000, frequency: "MONTHLY", icon: "💎" },
    { code: "m4", title: "Twin Flame", description: "Complete 12 duo sessions", reward: 300, xpReward: 1200, frequency: "MONTHLY", icon: "🔥" },
  ];

  for (const q of quests) {
    await prisma.quest.upsert({
      where: { code: q.code },
      update: q,
      create: { id: createId(), ...q },
    });
  }
  console.log(`✅ ${quests.length} quests seeded`);

  console.log("🌱 Seeding borders...");
  const borders = [
    { code: "br0",  label: "None",           description: "Clean slate. Let your results do the talking.",                    cost: 0,    rarity: "COMMON",    color: "transparent", color2: null,      icon: "○" },
    { code: "br1",  label: "Iron Ring",       description: "Forged in the gym. Cold, hard iron never lies.",                  cost: 150,  rarity: "COMMON",    color: "#8A8A8A",     color2: null,      icon: "⬜" },
    { code: "br2",  label: "Steel Pulse",     description: "A brushed-steel ring that hums with quiet confidence.",           cost: 200,  rarity: "COMMON",    color: "#A8C0CC",     color2: null,      icon: "🔘" },
    { code: "br3",  label: "Midnight Blue",   description: "Deep ocean calm. Train in the dark, shine in the light.",         cost: 220,  rarity: "COMMON",    color: "#1E3A8A",     color2: null,      icon: "🔵" },
    { code: "br4",  label: "Ember",           description: "Orange flame ring. Every rep is a spark.",                        cost: 350,  rarity: "RARE",      color: "#FF5E1A",     color2: "#FF8C42", icon: "🔶" },
    { code: "br5",  label: "Toxic Neon",      description: "Radioactive green glow. Gains so big they're illegal.",           cost: 400,  rarity: "RARE",      color: "#39FF14",     color2: "#00FF7F", icon: "🟢" },
    { code: "br6",  label: "Crimson Blade",   description: "Blood red edge. Warriors only. No excuses.",                      cost: 420,  rarity: "RARE",      color: "#DC143C",     color2: "#FF4560", icon: "🔴" },
    { code: "br7",  label: "Gold Rush",       description: "Shining gold. For those who never settle for silver.",            cost: 500,  rarity: "RARE",      color: "#FFD700",     color2: "#FFA500", icon: "🟡" },
    { code: "br8",  label: "Violet Storm",    description: "Electric purple ring. Unleash the beast within.",                 cost: 480,  rarity: "RARE",      color: "#8B5CF6",     color2: "#C084FC", icon: "🟣" },
    { code: "br9",  label: "Obsidian Void",   description: "Swallows light. Only the most disciplined wear the void.",        cost: 700,  rarity: "LEGENDARY", color: "#0D0D1A",     color2: "#FF5E1A", icon: "🖤" },
    { code: "br10", label: "Inferno Crown",   description: "Living fire border. Your dedication literally burns.",            cost: 900,  rarity: "LEGENDARY", color: "#FF2200",     color2: "#FF8800", icon: "👑" },
    { code: "br11", label: "Glacial Titan",   description: "Frozen tundra ring. Cold-blooded consistency.",                  cost: 850,  rarity: "LEGENDARY", color: "#00D4FF",     color2: "#FFFFFF", icon: "🧊" },
    { code: "br12", label: "Shadow Wraith",   description: "Invisible in the shadows. Unstoppable in the light.",             cost: 950,  rarity: "LEGENDARY", color: "#2D1B69",     color2: "#9333EA", icon: "👤" },
    { code: "br13", label: "Twin Flame",      description: "Two souls, one fire. Exclusive to duo legends only.",             cost: 1500, rarity: "MYTHIC",    color: "#FF5E1A",     color2: "#A855F7", icon: "🔥" },
    { code: "br14", label: "Celestial Arc",   description: "Born from dying stars. Reserved for the truly elite.",            cost: 2000, rarity: "MYTHIC",    color: "#FFD700",     color2: "#00D4FF", icon: "🌟" },
    { code: "br15", label: "Apex Sovereign",  description: "The highest rank. No one climbs higher than this.",               cost: 3000, rarity: "MYTHIC",    color: "#FF2200",     color2: "#FFD700", icon: "⚡" },
  ];

  for (const b of borders) {
    await prisma.border.upsert({
      where: { code: b.code },
      update: b,
      create: { id: createId(), ...b },
    });
  }
  console.log(`✅ ${borders.length} borders seeded`);

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
