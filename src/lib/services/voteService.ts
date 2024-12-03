/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta del archivo: /src/lib/services/voteService.ts

export interface Vote {
    voteId: string;
    storyId: string;
    userId: string;
    voto: number;
    comment?: string;
    createdAt: string;
}

interface VoteResponse {
    success: boolean;
    message: string;
    vote?: Vote;
    votes?: Vote[];
}

export class VoteService {
    /**
     * Registra un nuevo voto
     */
    static async submitVote(
        storyId: string, 
        value: number, 
        comment?: string
    ): Promise<VoteResponse> {
        try {
            const response = await fetch('/api/vote-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storyId,
                    value,
                    comment
                }),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: 'Error al registrar el voto',
            };
        }
    }

    /**
     * Obtiene todos los votos de una historia
     */
    static async getVotesByStory(storyId: string): Promise<VoteResponse> {
        try {
            const response = await fetch(`/api/vote-api?storyId=${storyId}`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: 'Error al obtener los votos',
                votes: []
            };
        }
    }

    /**
     * Obtiene el voto de un usuario específico para una historia
     */
    static async getUserVote(storyId: string, userId: string): Promise<VoteResponse> {
        try {
            const response = await fetch(`/api/vote-api/user?storyId=${storyId}&userId=${userId}`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: 'Error al obtener el voto del usuario',
            };
        }
    }
}