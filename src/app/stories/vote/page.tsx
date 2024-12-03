/* eslint-disable @typescript-eslint/no-unused-vars */
// Ruta del archivo: /src/app/stories/vote/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/authService';
import { StoryService, Story } from '@/lib/services/storyService';
import { VoteService } from '@/lib/services/voteService';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import VotingCards from '@/components/voting/VotingCards';

export default function VotePage() {
    const router = useRouter();
    const [user, setUser] = useState(AuthService.getUserSession());
    const [story, setStory] = useState<Story | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isVotingStarted, setIsVotingStarted] = useState(false);
    const [userVote, setUserVote] = useState<number | undefined>();

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) {
                router.push('/login');
                return;
            }

            const storyData = localStorage.getItem('currentStory');
            if (!storyData) {
                router.push('/stories');
                return;
            }

            const currentStory = JSON.parse(storyData);
            setStory(currentStory);
            setIsVotingStarted(currentStory.status === 'voting');

            // Cargar voto del usuario si existe
            try {
                const voteResponse = await VoteService.getUserVote(currentStory.storyId, user.userId);
                if (voteResponse.success && voteResponse.vote) {
                    setUserVote(voteResponse.vote.voto);
                }
            } catch (error) {
                console.error('Error loading user vote:', error);
            }

            setIsLoading(false);
        };

        loadInitialData();
    }, []);

    const handleStartVoting = async () => {
        if (!story) return;
        
        try {
            const updatedStory: Story = {
                ...story,
                status: 'voting' as const  // Especificamos el tipo literal
            };
            setStory(updatedStory);
            localStorage.setItem('currentStory', JSON.stringify(updatedStory));
            setIsVotingStarted(true);
            setToast({ message: 'Votación iniciada con éxito', type: 'success' });
        } catch (error) {
            setToast({ message: 'Error al iniciar la votación', type: 'error' });
        }
    };

    const handleVoteSubmitted = async () => {
        // Recargar el voto del usuario
        if (story && user) {
            const voteResponse = await VoteService.getUserVote(story.storyId, user.userId);
            if (voteResponse.success && voteResponse.vote) {
                setUserVote(voteResponse.vote.voto);
                setToast({ message: 'Voto registrado con éxito', type: 'success' });
            }
        }
    };

    const handleBackToStories = () => {
        localStorage.removeItem('currentStory');
        router.push('/stories');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleBackToStories}
                                className="text-gray-600 hover:text-gray-900 flex items-center"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Volver a Historias
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Votación de Historia
                            </h1>
                        </div>
                        {user?.role === 'project_manager' && !isVotingStarted && (
                            <button
                                onClick={handleStartVoting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Iniciar Votación
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando...</p>
                    </div>
                ) : story ? (
                    <div className="space-y-8">
                        {/* Story Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {story.title}
                            </h2>
                            <p className="text-gray-600 mb-4">{story.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Tiempo límite: {story.timeLimit} minutos</span>
                                </div>
                                {story.initialEstimate !== null && (
                                    <div className="flex items-center">
                                        <span>Estimación inicial: {story.initialEstimate} puntos</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Voting Cards */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Cartas de Votación
                            </h3>
                            <VotingCards
                                storyId={story.storyId}
                                isVotingStarted={isVotingStarted}
                                onVoteSubmitted={handleVoteSubmitted}
                                userVote={userVote}
                            />
                        </div>

                        {/* Participants */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Participantes
                            </h3>
                            <div className="space-y-2">
                                {/* TODO: Implementar lista de participantes */}
                                <p className="text-gray-600">
                                    Lista de participantes se mostrará aquí...
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No se encontró la historia seleccionada</p>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}