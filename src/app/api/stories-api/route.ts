// Ruta del archivo: /src/app/api/stories-api/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';

export async function GET(request: Request) {
    try {
        // Obtenemos el sessionId de los query params
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                message: 'ID de sesión no proporcionado'
            }, { status: 400 });
        }

        const storiesCollection = await getCollection('stories');
        const stories = await storiesCollection
            .find({ sessionId })
            .toArray();

        return NextResponse.json({
            success: true,
            message: 'Historias obtenidas con éxito',
            stories
        });
    } catch (error) {
        console.error('Error al obtener historias:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener las historias'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { sessionId, title, description, timeLimit, initialEstimate } = await request.json();

        const storiesCollection = await getCollection('stories');
        
        const newStory = {
            storyId: Date.now().toString(),
            sessionId,
            title,
            description,
            status: 'pending',
            timeLimit,
            initialEstimate,
            finalEstimate: null,
            createdAt: new Date().toISOString()
        };

        await storiesCollection.insertOne(newStory);

        return NextResponse.json({
            success: true,
            message: 'Historia creada con éxito',
            story: newStory
        });
    } catch (error) {
        console.error('Error al crear historia:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al crear la historia'
        }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { storyId, status, finalEstimate } = await request.json();
        
        const updateData = {
            status,
            ...(finalEstimate !== undefined ? { finalEstimate } : {})
        };

        const storiesCollection = await getCollection('stories');
        await storiesCollection.updateOne(
            { storyId },
            { $set: updateData }
        );

        const updatedStory = await storiesCollection.findOne({ storyId });

        return NextResponse.json({
            success: true,
            message: 'Historia actualizada con éxito',
            story: updatedStory
        });
    } catch (error) {
        console.error('Error updating story status:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al actualizar el estado'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { storyId } = await request.json();
        const storiesCollection = await getCollection('stories');
        
        // También eliminar los votos asociados
        const votesCollection = await getCollection('votos');
        await votesCollection.deleteMany({ storyId });
        
        await storiesCollection.deleteOne({ storyId });
        
        return NextResponse.json({
            success: true,
            message: 'Historia eliminada con éxito'
        });
    } catch (error) {
        console.error('Error deleting story:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al eliminar la historia'
        }, { status: 500 });
    }
}