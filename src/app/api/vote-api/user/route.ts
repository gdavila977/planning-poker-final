// Ruta del archivo: /src/app/api/vote-api/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { AuthService } from '@/lib/services/authService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storyId = searchParams.get('storyId');

        const votesCollection = await getCollection('votos');
        const votes = await votesCollection
            .find({ storyId })
            .toArray();

        return NextResponse.json({
            success: true,
            message: 'Votos obtenidos con éxito',
            votes
        });

    } catch (error) {
        console.error('Error obteniendo votos:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener los votos',
            votes: []
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { storyId, value, comment } = await request.json();
        const user = AuthService.getUserSession();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Usuario no autenticado'
            }, { status: 401 });
        }

        const votesCollection = await getCollection('votos');
        
        const newVote = {
            voteId: Date.now().toString(),
            storyId,
            userId: user.userId,
            voto: value,
            comment,
            createdAt: new Date().toISOString()
        };

        await votesCollection.insertOne(newVote);

        return NextResponse.json({
            success: true,
            message: 'Voto registrado con éxito',
            vote: newVote
        });

    } catch (error) {
        console.error('Error registrando voto:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al registrar el voto'
        }, { status: 500 });
    }
}