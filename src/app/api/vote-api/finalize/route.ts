// Ruta del archivo: /src/app/api/vote-api/finalize/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';

export async function POST(request: Request) {
    try {
        const { storyId, value, comment } = await request.json();
        
        const votesCollection = await getCollection('votos');
        
        const newVote = {
            voteId: Date.now().toString(),
            storyId,
            userId: value.userId,
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