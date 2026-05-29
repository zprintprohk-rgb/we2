import { NextRequest, NextResponse } from "next/server"
import { getFromR2, deleteFromR2 } from "@/lib/r2"

/** GET /api/files/users/abc123/.../render.png — 鉴权下载（支持多级路径） */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const r2Key = path.join("/")

  const result = await getFromR2(r2Key)
  if (!result) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const headers = new Headers()
  headers.set("Content-Type", result.contentType)
  headers.set("Cache-Control", "private, no-cache")

  if (result.body) {
    return new NextResponse(result.body, { headers })
  }

  return NextResponse.json({ error: "empty body" }, { status: 410 })
}

/** DELETE /api/files/... — 删除文件（需鉴权） */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const r2Key = path.join("/")

  // 简单鉴权：检查 Bearer token 存在性
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  await deleteFromR2(r2Key)
  return NextResponse.json({ deleted: true })
}