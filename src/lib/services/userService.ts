// Ruta del archivo: /src/lib/services/userService.ts

import { User } from '@/lib/models/auth';

export class UserService {
    static async getDevelopers(): Promise<User[]> {
        try {
            const response = await fetch('/api/users-api/developers');
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Error al obtener developers:', error);
            return [];
        }
    }
}