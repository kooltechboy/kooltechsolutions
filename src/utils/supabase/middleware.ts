import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Admin role enforcement strategy:
 *
 * PRIMARY:  Check ADMIN_EMAILS env var (comma-separated list of admin email addresses).
 *           Zero DB schema changes needed; managed purely via environment config.
 *
 * UPGRADE:  When you add a `role` column to your `profiles` table, replace
 *           the email check below with a DB query:
 *           `await supabase.from('profiles').select('role').eq('id', user.id).single()`
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired — always call getUser() not getSession()
  // to ensure the token is validated server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Protect /portal routes ─────────────────────────────────────────────────
  if (pathname.startsWith('/portal') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── Protect /admin routes ──────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', '/admin')
      return NextResponse.redirect(url)
    }

    // Server-side admin role check
    const userEmail = user.email?.toLowerCase() ?? ''
    const isAdmin = ADMIN_EMAILS.length > 0
      ? ADMIN_EMAILS.includes(userEmail)
      : false // If no ADMIN_EMAILS configured, deny all admin access

    if (!isAdmin) {
      // Authenticated but not an admin — redirect to portal, not login
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      url.searchParams.delete('redirect')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
