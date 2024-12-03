// Ruta del archivo: /src/app/api/vote-api/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { AuthService } from '@/lib/services/authService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storyId = searchParams.get('storyId');
        const userId = searchParams.get('userId');

        if (!storyId) {
            return NextResponse.json({
                success: false,
                message: 'ID de historia no proporcionado'
            }, { status: 400 });
        }

        const votesCollection = await getCollection('votos');

        // Si se proporciona userId, buscar voto específico
        if (userId) {
            const vote = await votesCollection.findOne({ storyId, userId });
            return NextResponse.json({
                success: true,
                vote
            });
        }

        // Si no hay userId, retornar todos los votos de la historia
        const votes = await votesCollection
            .find({ storyId })
            .toArray();

        return NextResponse.json({
            success: true,
            votes
        });

    } catch (error) {
        console.error('Error al obtener votos:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener los votos'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = AuthService.getUserSession();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'Usuario no autenticado'
            }, { status: 401 });
        }

        const { storyId, value, comment } = await request.json();

        // Verificar si el usuario ya votó
        const votesCollection = await getCollection('votos');
        const existingVote = await votesCollection.findOne({
            storyId,
            userId: user.userId
        });

        if (existingVote) {
            return NextResponse.json({
                success: false,
                message: 'Ya has votado en esta historia'
            }, { status: 400 });
        }

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
        console.error('Error al registrar voto:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al registrar el voto'
        }, { status: 500 });
    }
}