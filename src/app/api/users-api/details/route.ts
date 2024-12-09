// Ruta del archivo: /src/app/api/users-api/details/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';

export async function POST(request: Request) {
    try {
        const { userIds } = await request.json();
        const usersCollection = await getCollection('users');
        
        const users = await usersCollection
            .find({ userId: { $in: userIds } })
            .project({ password: 0 })
            .toArray();

        return NextResponse.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener usuarios'
        }, { status: 500 });
    }
}