import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
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
    
    const base64 = buffer.toString('base64');
    const imageType = file.type;
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