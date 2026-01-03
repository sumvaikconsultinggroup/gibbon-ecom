import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default clerkMiddleware((auth, request: NextRequest) => {
  // Skip Clerk for admin API routes - they use custom auth
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    return NextResponse.next()
  }
  
  // Skip Clerk for public API routes
  if (request.nextUrl.pathname.startsWith('/api/collections') ||
      request.nextUrl.pathname.startsWith('/api/products') ||
      request.nextUrl.pathname.startsWith('/api/track') ||
      request.nextUrl.pathname.startsWith('/api/live')) {
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}