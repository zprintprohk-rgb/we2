import { NextResponse, NextRequest } from "next/server"
import { uploadToR2 } from "@/lib/r2"
import { createServerClient } from "@/lib/supabase"

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  // 身份鉴权
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const isPublic = formData.get("public") === "true"

  if (!file) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "file too large, max 10 MB" },
      { status: 413 },
    )
  }

  // 生成安全的 key
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
  const key = `users/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const buffer = await file.arrayBuffer()
  const url = await uploadToR2(key, buffer, {
    contentType: file.type || "application/octet-stream",
    userId: user.id,
    isPublic,
  })

  return NextResponse.json({ url, key })
}