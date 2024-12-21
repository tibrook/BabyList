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

    // Vérification de la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convertir en base64 et créer la data URL
    const base64 = buffer.toString('base64');
    const imageType = file.type;
    const dataUrl = `data:${imageType};base64,${base64}`;

    // Mettre à jour le gift avec l'image encodée
    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        imageData: base64,      // Stocker le base64 pur
        imageType: imageType,   // Stocker le type MIME
        imageUrl: dataUrl       // URL data complète pour utilisation directe
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