// Ruta del archivo: /src/lib/services/userService.ts

import { User } from '@/lib/models/auth';

interface UserResponse {
    success: boolean;
    message: string;
    users?: User[];
}

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

    static async getUsersByIds(userIds: string[]): Promise<UserResponse> {
        try {
            const response = await fetch('/api/users-api/details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return {
                success: false,
                message: 'Error al obtener usuarios',
                users: []
            };
        }
    }
}