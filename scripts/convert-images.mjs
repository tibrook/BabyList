// scripts/optimize-images.mjs
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

const prisma = new PrismaClient();

async function convertBase64ToBuffer(base64String) {
  const base64Data = base64String.includes(';base64,') 
    ? base64String.split(';base64,')[1]
    : base64String;
  
  return Buffer.from(base64Data, 'base64');
}

async function optimizeImages() {
  try {
    const gifts = await prisma.gift.findMany({
      where: {
        imageData: {
          not: null
        }
      }
    });

    console.log(`Found ${gifts.length} gifts with images to optimize`);

    for (const gift of gifts) {
      try {
        if (gift.imageData) {
          console.log(`Optimizing image for gift: ${gift.title}`);
          
          // Convertir le base64 en buffer
          const buffer = await convertBase64ToBuffer(gift.imageData);

          // Optimisation plus agressive
          const optimizedBuffer = await sharp(buffer)
            // Réduire la taille maximale
            .resize(400, 400, {
              fit: 'inside',
              withoutEnlargement: true
            })
            // Convertir en WebP avec une compression plus forte
            .webp({
              quality: 60, // Qualité réduite
              effort: 6,   // Effort de compression maximal
              nearLossless: true
            })
            .toBuffer();

          // Vérifier la taille du buffer optimisé
          const optimizedSize = optimizedBuffer.length;
          console.log(`Original size: ${buffer.length}, Optimized size: ${optimizedSize}`);

          // Reconvertir en base64
          const newBase64 = optimizedBuffer.toString('base64');
          const dataUrl = `data:image/webp;base64,${newBase64}`;

          // Mettre à jour le cadeau
          await prisma.gift.update({
            where: { id: gift.id },
            data: {
              imageData: newBase64,
              imageType: 'image/webp',
              imageUrl: dataUrl
            }
          });

          console.log(`✅ Successfully optimized image for gift: ${gift.title}`);
          console.log(`   Reduction: ${Math.round((1 - optimizedSize / buffer.length) * 100)}%`);
        }
      } catch (error) {
        console.error(`❌ Error optimizing image for gift ${gift.title}:`, error);
      }
    }

    console.log('Optimization completed');
  } catch (error) {
    console.error('Optimization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'optimisation
optimizeImages();