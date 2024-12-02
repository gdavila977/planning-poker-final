// Ruta del archivo: /src/app/api/auth-api/route.ts

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { LoginCredentials, LoginResponse, User } from '@/lib/models/auth';

export async function POST(request: Request) {
    try {
        // Obtener las credenciales del cuerpo de la petición
        const credentials: LoginCredentials = await request.json();
        console.log('Credenciales recibidas:', credentials);
        
        // Validar que se proporcionen las credenciales necesarias
        if (!credentials.email || !credentials.password) {
            return NextResponse.json({
                success: false,
                message: 'Email y contraseña son requeridos'
            } as LoginResponse, { status: 400 });
        }

        // Obtener la colección de usuarios
        const usersCollection = await getCollection('users');

        // Buscar el usuario por email
        const foundUser = await usersCollection.findOne({ 
            email: credentials.email 
        }) as User | null;

        console.log('Usuario encontrado:', foundUser);

        // Verificar si el usuario existe y la contraseña es correcta
        if (!foundUser || foundUser.password !== credentials.password) {
            return NextResponse.json({
                success: false,
                message: 'Credenciales inválidas'
            } as LoginResponse, { status: 401 });
        }

        // Crear objeto de sesión (excluyendo la contraseña)
        const userSession = {
            userId: foundUser.userId,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role
        };

        console.log('Sesión de usuario creada:', userSession);

        // Retornar respuesta exitosa
        return NextResponse.json({
            success: true,
            message: 'Login exitoso',
            user: userSession
        } as LoginResponse);

    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json({
            success: false,
            message: 'Error interno del servidor'
        } as LoginResponse, { status: 500 });
    }
}