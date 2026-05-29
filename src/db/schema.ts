import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core"

// ─── 用户资料（关联 Supabase Auth） ───
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth_uid: uuid("auth_uid").notNull().unique(), // Supabase Auth users.id
  email: text("email").notNull(),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 伴侣关系 ───
export const couples = pgTable("couples", {
  id: uuid("id").defaultRandom().primaryKey(),
  user1_id: uuid("user1_id")
    .notNull()
    .references(() => profiles.id),
  user2_id: uuid("user2_id")
    .notNull()
    .references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 数字宠物 ───
export const pets = pgTable("pets", {
  id: uuid("id").defaultRandom().primaryKey(),
  couple_id: uuid("couple_id")
    .notNull()
    .references(() => couples.id),
  name: text("name").notNull(),
  level: integer("level").default(1).notNull(),
  happiness: integer("happiness").default(70).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 时空胶囊 ───
export const capsules = pgTable("capsules", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => profiles.id),
  couple_id: uuid("couple_id").references(() => couples.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  unlock_date: timestamp("unlock_date").notNull(),
  is_locked: boolean("is_locked").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 相册 ───
export const albums = pgTable("albums", {
  id: uuid("id").defaultRandom().primaryKey(),
  couple_id: uuid("couple_id")
    .notNull()
    .references(() => couples.id),
  name: text("name").notNull(),
  is_private: boolean("is_private").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 动态（社区帖子） ───
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  author_id: uuid("author_id")
    .notNull()
    .references(() => profiles.id),
  couple_id: uuid("couple_id")
    .notNull()
    .references(() => couples.id),
  type: text("type").notNull(), // text | image | milestone
  content: text("content").notNull(),
  images: text("images").array(), // 图片 URL 数组
  is_anonymous: boolean("is_anonymous").default(false).notNull(),
  status: text("status").default("published").notNull(), // published | hidden
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 评论 ───
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  post_id: uuid("post_id")
    .notNull()
    .references(() => posts.id),
  author_id: uuid("author_id")
    .notNull()
    .references(() => profiles.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 点赞（联合主键防重复） ───
export const likes = pgTable(
  "likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    post_id: uuid("post_id")
      .notNull()
      .references(() => posts.id),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniq: primaryKey({ columns: [table.post_id, table.user_id] }),
  }),
)

// ─── 话题 ───
export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  post_count: integer("post_count").default(0).notNull(),
})

// ─── 挑战任务 ───
export const challenges = pgTable("challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  reward_points: integer("reward_points").default(0).notNull(),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
})

export const challengeParticipants = pgTable("challenge_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  challenge_id: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id),
  couple_id: uuid("couple_id")
    .notNull()
    .references(() => couples.id),
  completed_at: timestamp("completed_at"),
})

// ─── Web Push 订阅 ───
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => profiles.id),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 支付订单 ───
export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(), // out_trade_no or PayPal orderId
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    user_email: text("user_email"),
    gateway: text("gateway").notNull(), // paypal | alipay_cn | alipay_hk
    payment_id: text("payment_id"), // PayPal capture id or Alipay trade_no
    amount: integer("amount").notNull(), // 最小单位（分）
    currency: text("currency").notNull(),
    tier: text("tier").notNull(), // plus | premium | lifetime
    period: text("period").notNull(), // monthly | quarterly | yearly
    status: text("status").default("pending").notNull(), // pending | completed | failed
    gateway_raw: jsonb("gateway_raw"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    paid_at: timestamp("paid_at"),
  },
  (table) => ({
    idx_user_id: index("orders_user_id_idx").on(table.user_id),
    idx_payment_id: index("orders_payment_id_idx").on(table.payment_id),
    idx_status: index("orders_status_idx").on(table.status),
  }),
)

// ─── 会员订阅 ───
export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .unique()
    .references(() => profiles.id),
  tier: text("tier").notNull(),
  status: text("status").default("active").notNull(), // active | expired
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
})

// ─── 客服工单 ───
export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => profiles.id),
  type: text("type").notNull(), // bug | billing | moderation | other
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open").notNull(), // open | resolved | closed
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 引用 ───
export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  inviter_id: uuid("inviter_id")
    .notNull()
    .references(() => profiles.id),
  invitee_id: uuid("invitee_id")
    .notNull()
    .references(() => profiles.id),
  code: text("code").notNull(),
  status: text("status").default("invited").notNull(), // invited | signed_up | paid
  reward_claimed: boolean("reward_claimed").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// ─── 导出 Infer 类型 ───
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type Couple = typeof couples.$inferSelect
export type Pet = typeof pets.$inferSelect
export type NewPet = typeof pets.$inferInsert
export type Capsule = typeof capsules.$inferSelect
export type Album = typeof albums.$inferSelect
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type Like = typeof likes.$inferSelect
export type Topic = typeof topics.$inferSelect
export type Challenge = typeof challenges.$inferSelect
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect
export type PushSubscription = typeof pushSubscriptions.$inferSelect
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type Membership = typeof memberships.$inferSelect
export type Ticket = typeof tickets.$inferSelect
export type Referral = typeof referrals.$inferSelect