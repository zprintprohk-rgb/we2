import { createEdgeClient } from "./supabase"
import type {
  Profile,
  Couple,
  Post,
  NewPost,
  Comment,
  Order,
  NewOrder,
  Membership,
  Pet,
  NewPet,
  Capsule,
  Ticket,
} from "@/db/schema"

// ─── 类型输入 ───

export type CreatePostInput = Pick<
  NewPost,
  "author_id" | "couple_id" | "type" | "content"
> & { images?: string[]; is_anonymous?: boolean }

export type CreateOrderInput = Omit<NewOrder, "created_at"> & { created_at?: string }
export type CreatePetInput = Pick<NewPet, "couple_id" | "name"> & {
  level?: number
  happiness?: number
}

/* ───── Profiles ───── */

/** 通过 auth_uid 获取用户资料 */
export async function getUserProfile(authUid: string): Promise<Profile | null> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_uid", authUid)
    .maybeSingle()
  if (error) throw new Error(`getUserProfile: ${error.message}`)
  return data as Profile | null
}

/** 通过 profile 内部 ID 获取资料 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(`getProfileById: ${error.message}`)
  return (data as Profile) ?? null
}

/** 创建用户 profile（注册时由 DB trigger 自动执行，此方法为手动兜底） */
export async function createProfile(input: {
  authUid: string
  email: string
  displayName?: string
}): Promise<Profile> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      auth_uid: input.authUid,
      email: input.email,
      display_name: input.displayName ?? input.email.split("@")[0] ?? "User",
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createProfile: ${error.message}`)
  return data as Profile
}

/* ───── Couples ───── */

/** 获取用户所属的伴侣关系 */
export async function getCoupleByProfileId(profileId: string): Promise<Couple | null> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`)
    .maybeSingle()
  if (error) throw new Error(`getCoupleByProfileId: ${error.message}`)
  return data as Couple | null
}

/** 创建伴侣关系 */
export async function createCouple(user1Id: string, user2Id: string): Promise<Couple> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("couples")
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createCouple: ${error.message}`)
  return data as Couple
}

/* ───── Pets ───── */

/** 创建数字宠物 */
export async function createPet(input: CreatePetInput): Promise<Pet> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("pets")
    .insert({
      couple_id: input.couple_id,
      name: input.name,
      level: input.level ?? 1,
      happiness: input.happiness ?? 70,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createPet: ${error.message}`)
  return data as Pet
}

/** 喂养宠物（增加幸福值） */
export async function feedPet(petId: string, amount = 5): Promise<Pet> {
  const supabase = createEdgeClient()
  // 先读取当前幸福值
  const { data: current, error: readErr } = await supabase
    .from("pets")
    .select("happiness")
    .eq("id", petId)
    .single()
  if (readErr) throw new Error(`feedPet read: ${readErr.message}`)

  const newHappiness = Math.min(100, (current as { happiness: number }).happiness + amount)

  const { data: updated, error } = await supabase
    .from("pets")
    .update({ happiness: newHappiness })
    .eq("id", petId)
    .select()
    .single()
  if (error) throw new Error(`feedPet update: ${error.message}`)
  return updated as Pet
}

/** 获取伴侣的所有宠物 */
export async function getPetsByCouple(coupleId: string): Promise<Pet[]> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(`getPetsByCouple: ${error.message}`)
  return (data as Pet[]) ?? []
}

/* ───── Posts ───── */

/** 创建动态 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: input.author_id,
      couple_id: input.couple_id,
      type: input.type,
      content: input.content,
      images: input.images ?? [],
      is_anonymous: input.is_anonymous ?? false,
      status: "published",
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createPost: ${error.message}`)
  return data as Post
}

/** 分页获取伴侣的动态列表 */
export async function listPostsByCouple(
  coupleId: string,
  limit = 20,
  offset = 0,
): Promise<Post[]> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw new Error(`listPostsByCouple: ${error.message}`)
  return (data as Post[]) ?? []
}

/** 全局社区动态（仅公开可见） */
export async function listCommunityPosts(limit = 20, offset = 0): Promise<Post[]> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("is_anonymous", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw new Error(`listCommunityPosts: ${error.message}`)
  return (data as Post[]) ?? []
}

/* ───── Comments ───── */

/** 发布评论 */
export async function createComment(
  postId: string,
  authorId: string,
  content: string,
): Promise<Comment> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: authorId,
      content,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createComment: ${error.message}`)
  return data as Comment
}

/** 获取帖子评论 */
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(`getCommentsByPost: ${error.message}`)
  return (data as Comment[]) ?? []
}

/* ───── Orders ───── */

/** 创建待支付订单 */
export async function createPendingOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...input,
      status: input.status ?? "pending",
      created_at: input.created_at ?? new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createPendingOrder: ${error.message}`)
  return data as Order
}

/** 标记订单为已支付 + 激活会员 */
export async function completeOrder(
  orderId: string,
  gatewayResponse: Record<string, unknown>,
): Promise<Order> {
  const supabase = createEdgeClient()

  const { data: order, error: updateErr } = await supabase
    .from("orders")
    .update({
      status: "completed",
      gateway_raw: gatewayResponse,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single()

  if (updateErr) throw new Error(`completeOrder: ${updateErr.message}`)

  const completed = order as Order

  // 激活会员
  if (completed.status === "completed") {
    const days =
      completed.period === "yearly" ? 365 : completed.period === "quarterly" ? 90 : 30
    await activateMembership(completed.user_id, completed.tier, days)
  }

  return completed
}

/* ───── Memberships ───── */

/** 激活/续期会员（幂等 upsert） */
export async function activateMembership(
  userId: string,
  tier: string,
  days: number,
): Promise<Membership> {
  const supabase = createEdgeClient()
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("memberships")
    .upsert(
      {
        user_id: userId,
        tier,
        status: "active",
        updated_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single()

  if (error) throw new Error(`activateMembership: ${error.message}`)
  return data as Membership
}

/** 查询用户当前会员状态 */
export async function getMembership(userId: string): Promise<Membership | null> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()
  if (error) throw new Error(`getMembership: ${error.message}`)
  return data as Membership | null
}

/* ───── Capsules ───── */

/** 获取所有人可见的时间胶囊（按解锁日期正向排） */
export async function getUnlockedCapsulesByCouple(coupleId: string): Promise<Capsule[]> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("capsules")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("is_locked", false)
    .order("unlock_date", { ascending: true })
  if (error) throw new Error(`getUnlockedCapsulesByCouple: ${error.message}`)
  return (data as Capsule[]) ?? []
}

/* ───── Tickets ───── */

/** 创建客服工单 */
export async function createTicket(
  userId: string,
  type: string,
  title: string,
  description?: string,
): Promise<Ticket> {
  const supabase = createEdgeClient()
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      user_id: userId,
      type,
      title,
      description: description ?? null,
      status: "open",
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(`createTicket: ${error.message}`)
  return data as Ticket
}