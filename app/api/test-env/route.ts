import { NextResponse } from 'next/server';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  
  return NextResponse.json({
    status: 'success',
    message: 'Environment test',
    hasDatabaseUrl: !!databaseUrl,
    databaseUrlLength: databaseUrl ? databaseUrl.length : 0,
    databaseUrlPreview: databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'Not found',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('DATABASE'))
  });
} 