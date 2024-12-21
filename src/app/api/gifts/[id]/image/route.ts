// app/api/gifts/[id]/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gift = await prisma.gift.findUnique({
      where: { id: params.id },
      select: {
        imageData: true,
        imageType: true
      }
    });

    if (!gift?.imageData) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return NextResponse.json({
      imageData: gift.imageData,
      imageType: gift.imageType
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}