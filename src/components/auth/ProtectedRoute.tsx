// Ruta del archivo: /src/components/auth/ProtectedRoute.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!AuthService.isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Si el usuario está autenticado, mostrar el contenido
    return AuthService.isAuthenticated() ? <>{children}</> : null;
}