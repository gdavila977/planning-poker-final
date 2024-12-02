// Ruta del archivo: /src/lib/services/sessionService.ts

import { SessionResponse, CreateSessionRequest } from '../models/session';
import { AuthService } from './authService';

export class SessionService {
    /**
     * Obtiene todas las sesiones activas
     */
    static async getActiveSessions(): Promise<SessionResponse> {
        try {
            const response = await fetch('/api/sessions-api');
            const data: SessionResponse = await response.json();
            return data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return {
                success: false,
                message: 'Error al obtener las sesiones',
            };
        }
    }

    /**
     * Crea una nueva sesión de planning poker
     */
    static async createSession(sessionData: CreateSessionRequest): Promise<SessionResponse> {
        try {
            // Obtenemos el usuario actual
            const user = AuthService.getUserSession();
            if (!user) {
                return {
                    success: false,
                    message: 'Usuario no autenticado',
                };
            }
    
            const response = await fetch('/api/sessions-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionData,
                    userId: user.userId,
                    userRole: user.role
                }),
            });
            const data: SessionResponse = await response.json();
            return data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return {
                success: false,
                message: 'Error al crear la sesión',
            };
        }
    }

    /**
     * Obtiene el historial de sesiones
     */
    static async getSessionHistory(): Promise<SessionResponse> {
        try {
            const response = await fetch('/api/sessions-api/history');
            const data: SessionResponse = await response.json();
            return data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return {
                success: false,
                message: 'Error al obtener el historial',
            };
        }
    }
}