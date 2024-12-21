// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limite

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const giftId = formData.get('giftId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 80,
        effort: 4 
      })
      .toBuffer();

    const base64 = optimizedBuffer.toString('base64');
    const imageType = 'image/webp'; // Type MIME fixe pour WebP
    const dataUrl = `data:${imageType};base64,${base64}`;

    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        imageData: base64,
        imageType: imageType,
        imageUrl: dataUrl
      }
    });

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error },
      { status: 500 }
    );
  }
}