// Ruta del archivo: /src/app/stories/vote/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/authService';
import { StoryService, Story } from '@/lib/services/storyService';
import { VoteService } from '@/lib/services/voteService';
import { ArrowLeft, Clock } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import VotingCards from '@/components/voting/VotingCards';
import ParticipantsList from '@/components/voting/ParticipantsList';
import CountdownTimer from '@/components/voting/CountdownTimer';

export default function VotePage() {
    const router = useRouter();
    const [user] = useState(AuthService.getUserSession());
    const [story, setStory] = useState<Story | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isVotingStarted, setIsVotingStarted] = useState(false);
    const [userVote, setUserVote] = useState<number | undefined>();
    const [showVotes, setShowVotes] = useState(false);
    const [allVoted, setAllVoted] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) {
                router.push('/login');
                return;
            }

            const storyData = localStorage.getItem('currentStory');
            const sessionData = localStorage.getItem('currentSession');
            
            if (!storyData || !sessionData) {
                router.push('/stories');
                return;
            }

            const currentStory = JSON.parse(storyData);
            const session = JSON.parse(sessionData);
            
            setStory(currentStory);
            setCurrentSession(session);
            setIsVotingStarted(currentStory.status === 'voting');
            setShowVotes(currentStory.status === 'completed');

            if (user.role === 'developer') {
                try {
                    const voteResponse = await VoteService.getUserVote(currentStory.storyId, user.userId);
                    if (voteResponse.success && voteResponse.vote) {
                        setUserVote(voteResponse.vote.voto);
                    }
                } catch (error) {
                    console.error('Error loading user vote:', error);
                }
            }

            setIsLoading(false);
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        console.log('%c Estados actualizados:', 'background: #222; color: #bada55', { 
            allVoted, 
            isVotingStarted, 
            showVotes,
            userRole: user?.role 
        });
    }, [allVoted, isVotingStarted, showVotes]);

    const handleStartVoting = async () => {
        if (!story) return;
        
        try {
            const response = await StoryService.updateStoryStatus(story.storyId, 'voting');
            
            if (response.success && response.story) { // Verificamos que story existe
                setStory(response.story);
                localStorage.setItem('currentStory', JSON.stringify(response.story));
                setIsVotingStarted(true);
                setToast({ message: 'Votación iniciada con éxito', type: 'success' });
            } else {
                setToast({ message: response.message || 'Error al iniciar la votación', type: 'error' });
            }
        } catch (error) {
            console.error('Error al iniciar votación:', error);
            setToast({ message: 'Error al iniciar la votación', type: 'error' });
        }
    };

    const handleVoteSubmitted = async () => {
        if (story && user) {
            const voteResponse = await VoteService.getUserVote(story.storyId, user.userId);
            if (voteResponse.success && voteResponse.vote) {
                setUserVote(voteResponse.vote.voto);
                setToast({ message: 'Voto registrado con éxito', type: 'success' });
            }
        }
    };

    const handleAllVoted = () => {
        console.log('handleAllVoted llamado, actualizando estado');
        setAllVoted(true);
        // También podríamos mostrar un toast informando al PM que puede revelar los votos
        if (user?.role === 'project_manager') {
            console.log('Es PM, mostrando toast');
            setToast({ message: 'Todos han votado. Puede revelar los votos.', type: 'success' });
        }
    };

    const handleRevealVotes = async () => {
        if (!story) return;
    
        try {
            const votesResponse = await VoteService.getVotesByStory(story.storyId);
            
            if (votesResponse.success && votesResponse.votes && votesResponse.votes.length > 0) {
                const votes = votesResponse.votes.map(v => v.voto);
                const finalEstimate = Math.round(votes.reduce((a, b) => a + b) / votes.length);
                
                // Actualizar la historia con el finalEstimate
                const response = await StoryService.updateStoryStatus(
                    story.storyId, 
                    'completed',
                    finalEstimate  // Añadir este parámetro
                );
                
                if (response.success) {
                    const updatedStory = {
                        ...story,
                        status: 'completed' as const,
                        finalEstimate
                    };
                    
                    setStory(updatedStory);
                    localStorage.setItem('currentStory', JSON.stringify(updatedStory));
                    setShowVotes(true);
                    setToast({ message: 'Votos revelados y estimación final calculada', type: 'success' });
                }
            }
        } catch (error) {
            console.error('Error revealing votes:', error);
            setToast({ message: 'Error al revelar los votos', type: 'error' });
        }
    };

    const handleTimeUp = async () => {
        if (!story) return;
        
        try {
            const response = await StoryService.updateStoryStatus(story.storyId, 'completed');
            
            if (response.success && response.story) { // Verificamos que story existe
                setStory(response.story);
                localStorage.setItem('currentStory', JSON.stringify(response.story));
                setToast({ message: 'Tiempo de votación finalizado', type: 'success' });
            } else {
                setToast({ message: response.message || 'Error al finalizar la votación', type: 'error' });
            }
        } catch (error) {
            console.error('Error al finalizar votación:', error);
            setToast({ message: 'Error al finalizar la votación', type: 'error' });
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
                                Votación de Historia: {story?.title}
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
                        {/* Story Information with Timer */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div>
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
                                {isVotingStarted && (
                                    <div className="ml-4">
                                        <CountdownTimer
                                            minutes={story.timeLimit}
                                            isVotingStarted={isVotingStarted}
                                            isProjectManager={user?.role === 'project_manager'}
                                            allVoted={allVoted}
                                            onTimeUp={handleTimeUp}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Voting Cards - Solo para developers */}
                        {user?.role === 'developer' && (
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
                        )}

                        {/* Participants */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Participantes
                                </h3>
                                {user?.role === 'project_manager' && isVotingStarted && !showVotes && (
                                    <button
                                        onClick={handleRevealVotes}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                        disabled={!allVoted}
                                    >
                                        Revelar Votos
                                    </button>
                                )}
                            </div>
                            {currentSession && (
                                <ParticipantsList
                                    storyId={story.storyId}
                                    sessionParticipants={currentSession.participants}
                                    isProjectManager={user?.role === 'project_manager'}
                                    showVotes={showVotes}
                                    isVotingStarted={isVotingStarted}
                                    onAllVoted={handleAllVoted}
                                />
                            )}
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