// Ruta del archivo: /src/components/voting/VotingCards.tsx

import { useState } from 'react';
import { VoteService } from '@/lib/services/voteService';

interface VotingCardsProps {
    storyId: string;
    isVotingStarted: boolean;
    onVoteSubmitted: () => void;
    userVote?: number;
}

const FIBONACCI_VALUES = [1, 2, 3, 5, 8, 13, 21];

export default function VotingCards({ 
    storyId, 
    isVotingStarted, 
    onVoteSubmitted,
    userVote 
}: VotingCardsProps) {
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleCardClick = (value: number) => {
        if (!isVotingStarted || userVote !== undefined) return;
        setSelectedValue(value);
        setShowConfirmation(true);
    };

    const handleSubmitVote = async () => {
        if (!selectedValue) return;
    
        setIsSubmitting(true);
        try {
            console.log('Enviando voto:', {
                storyId,
                voto: selectedValue,  // Cambiado de value a voto
                comment
            });
    
            const response = await VoteService.submitVote(
                storyId,
                selectedValue,
                comment
            );
    
            if (response.success) {
                onVoteSubmitted();
                setShowConfirmation(false);
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVotingStarted) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-600">
                    Esperando a que el Project Manager inicie la votación...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {FIBONACCI_VALUES.map((value) => (
                    <button
                        key={value}
                        onClick={() => handleCardClick(value)}
                        disabled={userVote !== undefined}
                        className={`
                            aspect-[2/3] rounded-lg border-2 flex items-center justify-center 
                            text-xl font-bold transition-all transform hover:scale-105
                            ${userVote === value 
                                ? 'bg-blue-500 text-white border-blue-600' 
                                : userVote !== undefined
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : selectedValue === value
                                ? 'bg-blue-100 text-blue-600 border-blue-300'
                                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                            }
                        `}
                    >
                        {value}
                    </button>
                ))}
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Confirmar Voto
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Has seleccionado {selectedValue} puntos
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comentario (opcional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                rows={3}
                                placeholder="Añade un comentario sobre tu estimación..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setSelectedValue(null);
                                    setComment('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmitVote}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            >
                                {isSubmitting ? 'Enviando...' : 'Confirmar Voto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Display user's vote if already voted */}
            {userVote !== undefined && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                        Ya has votado en esta historia. Tu voto: <span className="font-bold">{userVote} puntos</span>
                    </p>
                </div>
            )}
        </div>
    );
}