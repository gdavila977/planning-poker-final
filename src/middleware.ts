// Ruta del archivo: /src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas que requieren autenticación
const protectedRoutes = ['/dashboard'];

// Lista de rutas públicas (no requieren autenticación)
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Si es una ruta protegida
    if (protectedRoutes.includes(pathname)) {
        // Permitir la solicitud ya que la verificación real se hará en el componente
        return NextResponse.next();
    }

    // Para las rutas públicas, permitir el acceso
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Para cualquier otra ruta, permitir el acceso
    return NextResponse.next();
}

export const config = {
    matcher: [...protectedRoutes, ...publicRoutes]
};