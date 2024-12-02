// Ruta del archivo: /src/app/api/users-api/developers/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';

export async function GET() {
    try {
        const usersCollection = await getCollection('users');
        const developers = await usersCollection
            .find({ role: 'developer' })
            .project({ password: 0 }) // Excluimos la contraseña
            .toArray();

        return NextResponse.json({ 
            success: true,
            users: developers 
        });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({ 
            success: false,
            message: 'Error al obtener desarrolladores' 
        }, { status: 500 });
    }
}