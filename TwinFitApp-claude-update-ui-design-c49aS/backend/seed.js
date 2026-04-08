require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");
const bcrypt = require("bcryptjs");
const { createId } = require("@paralleldrive/cuid2");

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL }).$extends(withAccelerate());

const QUESTS = [
  { code:"d1", title:"Morning Workout", description:"Complete a morning workout session", reward:50, xpReward:100, frequency:"DAILY", icon:"🌅" },
  { code:"d2", title:"Log Your Meal", description:"Log at least one meal today", reward:30, xpReward:60, frequency:"DAILY", icon:"🥗" },
  { code:"d3", title:"10k Steps", description:"Hit 10,000 steps today", reward:40, xpReward:80, frequency:"DAILY", icon:"👟" },
  { code:"d4", title:"Hydration Goal", description:"Drink 8 glasses of water", reward:20, xpReward:40, frequency:"DAILY", icon:"💧" },
  { code:"d5", title:"Partner Check-in", description:"Check in with your partner today", reward:60, xpReward:120, frequency:"DAILY", icon:"👥" },
  { code:"w1", title:"5 Workouts", description:"Complete 5 workouts this week", reward:200, xpReward:400, frequency:"WEEKLY", icon:"💪" },
  { code:"w2", title:"Meal Prep", description:"Prep meals for the week", reward:150, xpReward:300, frequency:"WEEKLY", icon:"🍱" },
  { code:"w3", title:"Duo Streak", description:"Maintain a 5-day duo streak", reward:300, xpReward:600, frequency:"WEEKLY", icon:"🔥" },
  { code:"w4", title:"New Exercise", description:"Try 3 new exercises this week", reward:100, xpReward:200, frequency:"WEEKLY", icon:"🎯" },
  { code:"m1", title:"20 Check-ins", description:"Complete 20 check-ins this month", reward:500, xpReward:1000, frequency:"MONTHLY", icon:"📸" },
  { code:"m2", title:"30-Day Streak", description:"Maintain a 30-day workout streak", reward:1000, xpReward:2000, frequency:"MONTHLY", icon:"🏆" },
  { code:"m3", title:"100 Meals Logged", description:"Log 100 meals this month", reward:400, xpReward:800, frequency:"MONTHLY", icon:"📊" },
  { code:"m4", title:"Partner Goal", description:"Hit your shared monthly goal", reward:800, xpReward:1600, frequency:"MONTHLY", icon:"🤝" },
];

const BORDERS = [
  { code:"br0",  label:"Default",     description:"The classic TwinFit border",       cost:0,    rarity:"COMMON",    color:"#FF5E1A",              icon:"⬜" },
  { code:"br1",  label:"Silver Ring", description:"Clean silver outline",              cost:100,  rarity:"COMMON",    color:"#C0C0C0",              icon:"⭕" },
  { code:"br2",  label:"Gold Halo",   description:"Warm golden glow",                  cost:250,  rarity:"COMMON",    color:"#FFD700",              icon:"✨" },
  { code:"br3",  label:"Ocean Wave",  description:"Deep blue gradient",                cost:150,  rarity:"COMMON",    color:"#3B82F6", color2:"#06B6D4", icon:"🌊" },
  { code:"br4",  label:"Forest",      description:"Natural green tones",               cost:150,  rarity:"COMMON",    color:"#22C55E", color2:"#16A34A", icon:"🌿" },
  { code:"br5",  label:"Sunset",      description:"Warm sunset gradient",              cost:200,  rarity:"RARE",      color:"#FF5E1A", color2:"#EAB308", icon:"🌅" },
  { code:"br6",  label:"Purple Haze", description:"Deep purple mystique",              cost:200,  rarity:"RARE",      color:"#A855F7", color2:"#7C3AED", icon:"💜" },
  { code:"br7",  label:"Crimson",     description:"Bold red border",                   cost:250,  rarity:"RARE",      color:"#EF4444", color2:"#DC2626", icon:"❤️" },
  { code:"br8",  label:"Arctic",      description:"Cool ice blue",                     cost:250,  rarity:"RARE",      color:"#BAE6FD", color2:"#38BDF8", icon:"❄️" },
  { code:"br9",  label:"Neon Green",  description:"Electric neon glow",                cost:300,  rarity:"RARE",      color:"#4ADE80", color2:"#22D3EE", icon:"⚡" },
  { code:"br10", label:"Plasma",      description:"Electric plasma border",            cost:500,  rarity:"LEGENDARY", color:"#FF5E1A", color2:"#A855F7", icon:"⚡" },
  { code:"br11", label:"Galaxy",      description:"Deep space gradient",               cost:600,  rarity:"LEGENDARY", color:"#6366F1", color2:"#EC4899", icon:"🌌" },
  { code:"br12", label:"Lava",        description:"Molten lava flow",                  cost:600,  rarity:"LEGENDARY", color:"#FF0000", color2:"#FF5E1A", icon:"🌋" },
  { code:"br13", label:"Aurora",      description:"Northern lights effect",            cost:700,  rarity:"LEGENDARY", color:"#34D399", color2:"#3B82F6", icon:"🌈" },
  { code:"br14", label:"Diamond",     description:"The ultra-rare diamond border",     cost:1000, rarity:"MYTHIC",    color:"#BAE6FD", color2:"#F0ABFC", icon:"💎" },
  { code:"br15", label:"Obsidian",    description:"The darkest mythic border",         cost:1200, rarity:"MYTHIC",    color:"#1F1F1F", color2:"#FF5E1A", icon:"🖤" },
];

const USERS = [
  { name:"Marcus", surname:"Johnson",  username:"marcus_j", email:"marcus@twinfit.app" },
  { name:"Sofia",  surname:"Martinez", username:"sofia_m",  email:"sofia@twinfit.app"  },
  { name:"Karim",  surname:"Hassan",   username:"karim_h",  email:"karim@twinfit.app"  },
  { name:"Aya",    surname:"Nakamura", username:"aya_n",    email:"aya@twinfit.app"    },
  { name:"Lucas",  surname:"Oliveira", username:"lucas_o",  email:"lucas@twinfit.app"  },
  { name:"Priya",  surname:"Patel",    username:"priya_p",  email:"priya@twinfit.app"  },
  { name:"Alex",   surname:"Chen",     username:"alex_c",   email:"alex@twinfit.app"   },
  { name:"Zara",   surname:"Williams", username:"zara_w",   email:"zara@twinfit.app"   },
  { name:"Dante",  surname:"Romano",   username:"dante_r",  email:"dante@twinfit.app"  },
  { name:"Yuki",   surname:"Tanaka",   username:"yuki_t",   email:"yuki@twinfit.app"   },
];

async function seed() {
  console.log("Seeding quests...");
  for (const q of QUESTS) {
    await prisma.quest.upsert({ where: { code: q.code }, update: {}, create: { id: createId(), ...q } });
  }
  console.log("Seeding borders...");
  for (const b of BORDERS) {
    await prisma.border.upsert({ where: { code: b.code }, update: {}, create: { id: createId(), ...b } });
  }
  console.log("Seeding users...");
  const hash = await bcrypt.hash("TwinFit2024!", 10);
  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const user = await prisma.user.create({ data: { id: createId(), ...u, passwordHash: hash } });
      await prisma.profile.create({ data: { id: createId(), userId: user.id, avatarEmoji: "🦁" } });
      await prisma.dumbbellWallet.create({ data: { id: createId(), userId: user.id, balance: 500, totalEarned: 500, xp: 200 } });
      console.log("  Created", u.email);
    } else {
      console.log("  Exists", u.email);
    }
  }
  console.log("Done!");
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
