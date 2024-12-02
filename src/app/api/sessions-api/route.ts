/* eslint-disable @typescript-eslint/no-unused-vars */
// /src/app/api/sessions-api/route.ts
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SessionResponse, CreateSessionRequest, PlanningSession, SessionDocument } from '@/lib/models/session';

export async function GET() {
    try {
        const sessionsCollection = await getCollection('sessions');
        const sessions = await sessionsCollection
            .find({ status: 'active' })
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