import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint to verify the API is working
 */
export async function GET() {
  try {
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
          node: process.version,
          nextVersion: process.env.npm_package_dependencies_next || 'unknown',
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
