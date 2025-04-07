import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware that does nothing but pass through requests
export function middleware(_req: NextRequest) {
  // Just pass through all requests without any auth checking
  return NextResponse.next();
}

// Match no routes - effectively disabling middleware
export const config = {
  matcher: [],
};
