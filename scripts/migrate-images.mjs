// scripts/migrate-images.mjs
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function convertImageUrlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const contentType = response.headers.get('content-type');
    const dataUrl = `data:${contentType};base64,${base64}`;
    return {
      base64,
      contentType,
      dataUrl
    };
  } catch (error) {
    console.error('Error converting image:', error);
    return null;
  }
}

async function migrateImages() {
  try {
    // Récupérer tous les cadeaux avec des images Cloudinary
    const gifts = await prisma.gift.findMany({
      where: {
        imageUrl: {
          contains: 'cloudinary',
        },
      },
    });

    console.log(`Found ${gifts.length} gifts with Cloudinary images`);

    // Convertir chaque image
    for (const gift of gifts) {
      try {
        if (gift.imageUrl) {
          console.log(`Converting image for gift: ${gift.title}`);
          const convertedImage = await convertImageUrlToBase64(gift.imageUrl);
          
          if (convertedImage) {
            await prisma.gift.update({
              where: { id: gift.id },
              data: {
                imageData: convertedImage.base64,
                imageType: convertedImage.contentType,
                imageUrl: convertedImage.dataUrl,
              },
            });
            console.log(`✅ Successfully converted image for gift: ${gift.title}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error converting image for gift ${gift.title}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateImages();