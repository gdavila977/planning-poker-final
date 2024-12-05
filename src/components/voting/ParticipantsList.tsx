// Ruta del archivo: /src/components/voting/ParticipantsList.tsx

import { useEffect, useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { VoteService } from '@/lib/services/voteService';
import { UserService } from '@/lib/services/userService';
import { User } from '@/lib/models/auth';

interface ParticipantStatus extends User {
    hasVoted: boolean;
    vote?: number;
    comment?: string;
}

interface ParticipantsListProps {
    storyId: string;
    sessionParticipants: string[];
    isProjectManager: boolean;
    showVotes: boolean;
    isVotingStarted: boolean;
    onAllVoted: () => void;
}

export default function ParticipantsList({
    storyId,
    sessionParticipants,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isProjectManager,
    showVotes,
    isVotingStarted,
    onAllVoted
}: ParticipantsListProps) {
    const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadParticipantsAndVotes = async () => {
            try {
                const userResponse = await UserService.getUsersByIds(sessionParticipants);
                
                if (!userResponse.success || !userResponse.users) {
                    setIsLoading(false);
                    return;
                }

                // Filtrar solo developers
                const developers = userResponse.users.filter(
                    (user): user is User => user.role === 'developer'
                );

                if (isVotingStarted) {
                    const votesResponse = await VoteService.getVotesByStory(storyId);
                    const votes = votesResponse.success ? votesResponse.votes || [] : [];

                    const participantsWithVotes = developers.map(dev => ({
                        ...dev,
                        hasVoted: votes.some(v => v.userId === dev.userId),
                        vote: votes.find(v => v.userId === dev.userId)?.voto,
                        comment: votes.find(v => v.userId === dev.userId)?.comment
                    }));

                    setParticipants(participantsWithVotes);

                    // Verificar si todos los developers han votado
                    if (participantsWithVotes.every(p => p.hasVoted)) {
                        onAllVoted();
                    }
                } else {
                    setParticipants(developers.map(dev => ({
                        ...dev,
                        hasVoted: false
                    })));
                }
            } catch (error) {
                console.error('Error loading participants:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadParticipantsAndVotes();

        // Si la votación está en curso, actualizar cada 5 segundos
        let interval: NodeJS.Timeout;
        if (isVotingStarted) {
            interval = setInterval(loadParticipantsAndVotes, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [storyId, sessionParticipants, isVotingStarted]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const developersCount = participants.length;
    const votedCount = participants.filter(p => p.hasVoted).length;

    return (
        <div className="space-y-4">
            {participants.map((participant) => (
                <div 
                    key={participant.userId}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                    <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                            participant.hasVoted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="font-medium text-gray-700">
                            {participant.name}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {participant.hasVoted ? (
                            <>
                                <Check className="h-4 w-4 text-green-500" />
                                {showVotes && participant.vote && (
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-600">
                                            {participant.vote} puntos
                                        </span>
                                        {participant.comment && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                &#39;{participant.comment}&#39;
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                        )}
                    </div>
                </div>
            ))}

            {isVotingStarted && developersCount > 0 && (
                <div className={`mt-4 p-4 rounded-lg ${
                    votedCount === developersCount ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                    <span className={`text-sm ${
                        votedCount === developersCount ? 'text-green-600' : 'text-blue-600'
                    }`}>
                        {votedCount === developersCount
                            ? 'Todos los developers han votado'
                            : `${votedCount} de ${developersCount} developers han votado`}
                    </span>
                </div>
            )}
        </div>
    );
}