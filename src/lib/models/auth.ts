// Ruta del archivo: /src/lib/models/auth.ts

/**
 * Interface para los datos del usuario
 */
export interface User {
    userId: string;
    name: string;
    email: string;
    password: string;
    role: 'project_manager' | 'developer';
}

/**
 * Interface para los datos que se guardarán en localStorage
 * Excluimos la contraseña por seguridad
 */
export interface UserSession {
    userId: string;
    name: string;
    email: string;
    role: 'project_manager' | 'developer';
}

/**
 * Interface para los datos del formulario de login
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Interface para la respuesta del login
 */
export interface LoginResponse {
    success: boolean;
    message: string;
    user?: UserSession;
}