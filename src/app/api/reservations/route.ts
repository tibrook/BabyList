// src/app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('giftId');

    if (!giftId) {
      return NextResponse.json({
        success: false,
        error: 'L\'identifiant du cadeau est requis'
      }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { giftId }
    });

    if (!reservation) {
      return NextResponse.json({
        success: false,
        error: 'Réservation non trouvée'
      }, { status: 404 });
    }

    // Correction ici : attendre la résolution de la promesse cookies()
    const cookiesList = await cookies();
    const reservationToken = cookiesList.get(`reservation_${giftId}`);

    if (!reservationToken || reservationToken.value !== reservation.token) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé à annuler cette réservation'
      }, { status: 401 });
    }

    await prisma.reservation.delete({
      where: { giftId }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Réservation annulée avec succès'
    });

    response.cookies.delete(`reservation_${giftId}`);

    return response;

  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    return NextResponse.json({
      success: false,
      error: 'Une erreur est survenue lors de l\'annulation'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Format de requête invalide'
      }, { status: 400 });
    }

    if (!data.giftId || !data.firstName || !data.lastName) {
      return NextResponse.json({
        success: false,
        error: 'Les champs prénom, nom et identifiant du cadeau sont requis'
      }, { status: 400 });
    }

    const gift = await prisma.gift.findUnique({
      where: { id: data.giftId },
      include: { reservation: true }
    });

    if (!gift) {
      return NextResponse.json({
        success: false,
        error: 'Cadeau non trouvé'
      }, { status: 404 });
    }

    if (gift.reservation) {
      return NextResponse.json({
        success: false,
        error: 'Ce cadeau a déjà été réservé'
      }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');

    try {
      const reservation = await prisma.reservation.create({
        data: {
          giftId: gift.id,
          firstName: data.firstName,
          lastName: data.lastName,
          message: data.message || '',
          isAnonymous: Boolean(data.isAnonymous),
          token
        }
      });

      const response = NextResponse.json({
        success: true,
        data: reservation
      });

      response.cookies.set(`reservation_${gift.id}`, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 // 1 an
      });

      return response;

    } catch (prismaError) {
      console.error('Erreur Prisma:', prismaError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création de la réservation'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json({
      success: false,
      error: 'Une erreur est survenue lors de la réservation'
    }, { status: 500 });
  }
}