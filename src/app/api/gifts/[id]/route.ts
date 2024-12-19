import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.$connect()
    const data = await request.json()
    const id = (await params).id

    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Le titre et la catégorie sont requis' },
        { status: 400 }
      )
    }

    const gift = await prisma.gift.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        productUrl: data.productUrl || null,
        imageUrl: data.imageUrl || null,
      }
    })

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.$connect()
    const id = (await params).id

    const gift = await prisma.gift.findUnique({
      where: { id },
      include: { reservation: true }
    })

    if (!gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      )
    }

    if (gift.reservation) {
      await prisma.reservation.delete({
        where: { id: gift.reservation.id }
      })
    }

    await prisma.gift.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete gift' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}