import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:62221085@localhost:3306/newlife_recovery_db",
      },
    },
  });
  
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 'test' as message`;
    await prisma.$disconnect();
    return NextResponse.json({ status: "success", result });
  } catch (e) {
    await prisma.$disconnect();
    return NextResponse.json({ status: "error", error: String(e) });
  }
} 