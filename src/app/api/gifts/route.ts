import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    
    const gifts = await prisma.gift.findMany({
      include: {
        reservation: true
      }
    })
    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Error connecting or fetching:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect()
    const data = await request.json()

    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    const gift = await prisma.gift.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description ?? null,
        price: data.price ?? null,
        productUrl: data.productUrl ?? null,
        imageUrl: data.imageUrl ?? null
      }
    })

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Detailed error:', error)
    
    // Vérification du type d'erreur et extraction sécurisée du message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Database error', details: errorMessage },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}