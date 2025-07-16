import 'dotenv/config';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Test a simple query
    const clientCount = await prisma.client.count();
    console.log(`Found ${clientCount} clients in database`);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      clientCount: clientCount
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Error details:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: (error as Error)?.message || 'Unknown error',
      stack: (error as Error)?.stack
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 