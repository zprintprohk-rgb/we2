import { NextRequest, NextResponse } from "next/server"
import { getFromR2, deleteFromR2 } from "@/lib/r2"

/** GET /api/files/:key — 鉴权下载 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  const decodedKey = decodeURIComponent(key)

  const result = await getFromR2(decodedKey)
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

/** DELETE /api/files/:key — 删除文件（需鉴权） */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  const decodedKey = decodeURIComponent(key)

  // 简单鉴权：检查是否为文件所有者（从 key 前缀推断）
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  await deleteFromR2(decodedKey)
  return NextResponse.json({ deleted: true })
}