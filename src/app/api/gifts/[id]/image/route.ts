// app/api/gifts/[id]/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;
    console.log('Fetching image for gift ID:', id);

    if (!id) {
      console.log('No ID provided');
      return NextResponse.json(
        { error: 'ID required' },
        { status: 400 }
      );
    }

    const gift = await prisma.gift.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        imageData: true,
        imageType: true
      }
    });

    console.log('Found gift:', gift ? gift.id : 'null', 'title:', gift?.title);
    console.log('Has imageData:', !!gift?.imageData);
    console.log('ImageType:', gift?.imageType);

    if (!gift || !gift.imageData) {
      console.log('Gift or image not found');
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      imageData: gift.imageData,
      imageType: gift.imageType || 'image/webp'
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}