export const runtime = 'edge'

export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NEXTJS_ENV ?? process.env.NODE_ENV ?? 'unknown',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}