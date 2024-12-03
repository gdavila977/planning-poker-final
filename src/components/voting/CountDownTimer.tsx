// Ruta del archivo: /src/components/voting/CountdownTimer.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CountdownTimerProps {
    minutes: number;
    isVotingStarted: boolean;
    isProjectManager: boolean;
    allVoted: boolean;
    onTimeUp: () => void;
}

export default function CountdownTimer({
    minutes,
    isVotingStarted,
    isProjectManager,
    allVoted,
    onTimeUp
}: CountdownTimerProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(minutes * 60);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!isVotingStarted || timeLeft <= 0 || allVoted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowModal(true);
                    onTimeUp();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isVotingStarted, timeLeft, allVoted]);

    useEffect(() => {
        if (allVoted && isVotingStarted) {
            setShowModal(true);
        }
    }, [allVoted, isVotingStarted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleModalConfirm = () => {
        if (!isProjectManager) {
            localStorage.removeItem('currentStory');
            router.push('/stories');
        }
        setShowModal(false);
    };

    const isTimeAlmostUp = timeLeft <= 30 && timeLeft > 0;

    return (
        <div className="text-center">
            <div
                className={`text-3xl font-bold ${
                    isTimeAlmostUp ? 'text-red-600' : 'text-gray-700'
                }`}
            >
                {formatTime(timeLeft)}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {isProjectManager 
                                ? allVoted 
                                    ? 'Todos los participantes han votado'
                                    : 'Tiempo de votación finalizado'
                                : 'Votación finalizada'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {isProjectManager
                                ? 'Puede proceder a revelar los votos cuando lo considere oportuno.'
                                : 'Gracias por participar en la votación.'}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={handleModalConfirm}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {isProjectManager ? 'Entendido' : 'Volver a historias'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}