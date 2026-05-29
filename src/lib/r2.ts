import { getCloudflareContext } from "@opennextjs/cloudflare"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R2Bucket = any

const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""

function getBucket(env: Record<string, unknown>): R2Bucket {
  const bucket = (env as Record<string, R2Bucket>).R2
  if (!bucket) {
    throw new Error("R2 bucket not bound. Add [[r2_buckets]] to wrangler.toml.")
  }
  return bucket
}

/**
 * 上传文件到 R2
 * @returns 公开访问 URL（若配置了自定义域）或 Worker 代理 URL
 */
export async function uploadToR2(
  key: string,
  data: ArrayBuffer | ReadableStream,
  options: {
    contentType: string
    userId?: string
    projectId?: string
    isPublic?: boolean
  },
): Promise<string> {
  const { env } = await getCloudflareContext({ async: true })
  const bucket = getBucket(env as Record<string, unknown>)

  await bucket.put(key, data, {
    httpMetadata: {
      contentType: options.contentType,
      cacheControl: options.isPublic
        ? "public, max-age=31536000, immutable"
        : "private, no-cache",
    },
    customMetadata: {
      userId: options.userId ?? "",
      projectId: options.projectId ?? "",
    },
  })

  // 优先使用自定义域 CDN URL，否则退回 Worker 代理路径
  if (CDN_BASE && !CDN_BASE.includes("localhost")) {
    return `${CDN_BASE.replace(/\/$/, "")}/${key}`
  }
  return `/api/files/${encodeURIComponent(key)}`
}

/**
 * 从 R2 拉取文件（用于鉴权下载）
 */
export async function getFromR2(key: string) {
  const { env } = await getCloudflareContext({ async: true })
  const bucket = getBucket(env as Record<string, unknown>)

  const object = await bucket.get(key)
  if (!object) return null

  return {
    body: object.body,
    contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
    size: object.size,
    metadata: object.customMetadata,
  }
}

/** 删除 R2 文件 */
export async function deleteFromR2(key: string) {
  const { env } = await getCloudflareContext({ async: true })
  const bucket = getBucket(env as Record<string, unknown>)
  await bucket.delete(key)
}

/** 列出用户文件（前缀匹配） */
export async function listUserFiles(userId: string, prefix?: string) {
  const { env } = await getCloudflareContext({ async: true })
  const bucket = getBucket(env as Record<string, unknown>)
  if (!bucket) return []

  const userPrefix = `users/${userId}/${prefix ?? ""}`
  const objects = await bucket.list({ prefix: userPrefix })
  return objects.objects.map((o: Record<string, unknown>) => ({
    key: o.key as string,
    size: o.size as number,
    uploadedAt: o.uploaded as Date,
  }))
}