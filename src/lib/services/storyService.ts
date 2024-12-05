/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta del archivo: /src/lib/services/storyService.ts

export interface Story {
    storyId: string;
    sessionId: string;
    title: string;
    description: string;
    status: 'pending' | 'voting' | 'completed';
    timeLimit: number;
    initialEstimate: number | null;
    finalEstimate: number | null;
    createdAt: string;
}

interface StoryResponse {
    success: boolean;
    message: string;
    stories?: Story[];
    story?: Story;
}

export class StoryService {
    static async getStoriesBySession(sessionId: string): Promise<StoryResponse> {
        try {
            const response = await fetch(`/api/stories-api?sessionId=${sessionId}`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: 'Error al obtener las historias'
            };
        }
    }

    static async createStory(storyData: Partial<Story>): Promise<StoryResponse> {
        try {
            const response = await fetch('/api/stories-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storyData),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: 'Error al crear la historia'
            };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async updateStoryStatus(storyId: string, status: 'pending' | 'voting' | 'completed'): Promise<any> {
        try {
            const response = await fetch(`/api/stories-api`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ storyId, status }),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: 'Error al actualizar el estado de la historia'
            };
        }
    }

    
}