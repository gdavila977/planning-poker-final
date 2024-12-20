/* eslint-disable @typescript-eslint/no-unused-vars */
// /src/app/api/sessions-api/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionResponse, CreateSessionRequest, PlanningSession, SessionDocument } from '@/lib/models/session';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'active';

        const sessionsCollection = await getCollection('sessions');
        const sessions = await sessionsCollection
            .find({ 
                status: type === 'active' 
                    ? 'active'
                    : { $in: ['completed', 'cancelled'] }
            })
            .sort({ createdAt: -1 })
            .toArray() as SessionDocument[];

        return NextResponse.json({
            success: true,
            message: 'Sesiones obtenidas con éxito',
            sessions
        } as SessionResponse);

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Error al obtener las sesiones'
        } as SessionResponse, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { sessionData, userId, userRole } = await request.json();

        if (userRole !== 'project_manager') {
            return NextResponse.json({
                success: false,
                message: 'No autorizado para crear sesiones'
            } as SessionResponse, { status: 403 });
        }

        const sessionsCollection = await getCollection('sessions');
        
        const newSession: PlanningSession = {
            sessionId: Date.now().toString(),
            ...sessionData,
            createdBy: userId,
            participants: [...(sessionData.participants || []), userId],
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        const result = await sessionsCollection.insertOne(newSession);
        const insertedSession = { ...newSession, _id: result.insertedId } as SessionDocument;

        return NextResponse.json({
            success: true,
            message: 'Sesión creada con éxito',
            sessions: [insertedSession]
        } as SessionResponse);

    } catch (error) {
        console.error('Error al crear sesión:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al crear la sesión'
        } as SessionResponse, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { sessionId, userId, userRole } = await request.json();
        
        if (userRole !== 'project_manager') {
            return NextResponse.json({
                success: false,
                message: 'No autorizado para eliminar sesiones'
            } as SessionResponse, { status: 403 });
        }

        const sessionsCollection = await getCollection('sessions');
        
        // Verificar que la sesión existe y pertenece al PM
        const session = await sessionsCollection.findOne({ 
            sessionId, 
            createdBy: userId 
        });

        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'Sesión no encontrada o no autorizado'
            } as SessionResponse, { status: 404 });
        }

        await sessionsCollection.deleteOne({ sessionId });

        return NextResponse.json({
            success: true,
            message: 'Sesión eliminada con éxito'
        } as SessionResponse);
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Error al eliminar la sesión'
        } as SessionResponse, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { sessionId, updateData, userId, userRole } = await request.json();
        
        if (userRole !== 'project_manager') {
            return NextResponse.json({
                success: false,
                message: 'No autorizado para actualizar sesiones'
            } as SessionResponse, { status: 403 });
        }

        const sessionsCollection = await getCollection('sessions');
        
        // Verificar que la sesión existe y pertenece al PM
        const session = await sessionsCollection.findOne({ 
            sessionId, 
            createdBy: userId 
        });

        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'Sesión no encontrada o no autorizado'
            } as SessionResponse, { status: 404 });
        }

        await sessionsCollection.updateOne(
            { sessionId },
            { $set: updateData }
        );

        const updatedSession = await sessionsCollection.findOne({ sessionId });

        return NextResponse.json({
            success: true,
            message: 'Sesión actualizada con éxito',
            sessions: updatedSession ? [updatedSession] : undefined
        } as SessionResponse);
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Error al actualizar la sesión'
        } as SessionResponse, { status: 500 });
    }
}