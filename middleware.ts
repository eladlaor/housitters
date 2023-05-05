import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // console.log('hi Im a middleware. next url:', request.nextUrl)
  // return NextResponse.rewrite(request.nextUrl)
}

// export const config = {
//   matcher: '/housitters/HousitterAccount',
// }
