// app/api/gifts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const gift = await prisma.gift.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price ? parseFloat(body.price.toString()) : null,
        category: body.category,
        productUrl: body.productUrl,
        priority: body.priority || 'NORMAL',
        imageUrl: body.imageUrl,
        imageType: body.imageType,
        imageData: body.imageData
      }
    });

    return NextResponse.json(gift);
  } catch (error) {
    console.error('Gift creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create gift' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        productUrl: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        reservation: true,
        imageUrl: true,
        imageType: true,
      },
    });
    
    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}