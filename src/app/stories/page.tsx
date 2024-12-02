// Ruta del archivo: /src/app/stories/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/authService';
import { StoryService, Story } from '@/lib/services/storyService';
import { Plus, Clock, ArrowLeft, BookOpen } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { SessionDocument } from '@/lib/models/session';

interface NewStory {
    title: string;
    description: string;
    timeLimit: number;
    initialEstimate: number | null;
}

export default function StoriesPage() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState(AuthService.getUserSession());
    const [currentSession, setCurrentSession] = useState<SessionDocument | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [newStory, setNewStory] = useState<NewStory>({
        title: '',
        description: '',
        timeLimit: 5,
        initialEstimate: null
    });
    const storiesPerPage = 6;

    useEffect(() => {
        // Verificar autenticación
        if (!user) {
            router.push('/login');
            return;
        }

        // Obtener sesión actual del localStorage
        const sessionData = localStorage.getItem('currentSession');
        if (!sessionData) {
            router.push('/dashboard');
            return;
        }

        const session = JSON.parse(sessionData);
        setCurrentSession(session);
        loadStories(session.sessionId);
    }, []);

    const loadStories = async (sessionId: string) => {
        setIsLoading(true);
        try {
            const response = await StoryService.getStoriesBySession(sessionId);
            if (response.success && response.stories) {
                setStories(response.stories);
            }
        } catch (error) {
            console.error('Error loading stories:', error);
            setToast({ message: 'Error al cargar las historias', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSession) return;

        try {
            const storyData = {
                ...newStory,
                sessionId: currentSession.sessionId
            };

            const response = await StoryService.createStory(storyData);
            
            if (response.success) {
                setShowCreateModal(false);
                setNewStory({
                    title: '',
                    description: '',
                    timeLimit: 5,
                    initialEstimate: null
                });
                loadStories(currentSession.sessionId);
                setToast({ message: 'Historia creada con éxito', type: 'success' });
            } else {
                setToast({ message: response.message || 'Error al crear la historia', type: 'error' });
            }
        } catch (error) {
            console.error('Error creating story:', error);
            setToast({ message: 'Error al crear la historia', type: 'error' });
        }
    };

    const handleBackToDashboard = () => {
        // Limpiar localStorage antes de volver
        localStorage.removeItem('currentSession');
        router.push('/dashboard');
    };

    const getCurrentPageStories = () => {
        const startIndex = (currentPage - 1) * storiesPerPage;
        const endIndex = startIndex + storiesPerPage;
        return stories.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(stories.length / storiesPerPage);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleBackToDashboard}
                                className="text-gray-600 hover:text-gray-900 flex items-center"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Volver al Dashboard
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Sesión: {currentSession?.name || 'Cargando...'}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Historias de Usuario</h2>
                    {user?.role === 'project_manager' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nueva Historia
                        </button>
                    )}
                </div>

                {/* Stories Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando historias...</p>
                    </div>
                ) : stories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getCurrentPageStories().map((story) => (
                            <div
                                key={story.storyId}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900">{story.title}</h3>
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        story.status === 'completed' 
                                            ? 'bg-green-100 text-green-800'
                                            : story.status === 'voting'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {story.status === 'completed' ? 'Completada' : 
                                         story.status === 'voting' ? 'En votación' : 'Pendiente'}
                                    </span>
                                </div>
                                <p className="mt-2 text-gray-600">{story.description}</p>
                                <div className="mt-4 flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Tiempo límite: {story.timeLimit} minutos</span>
                                </div>
                                {story.initialEstimate !== null && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <span>Estimación inicial del PM: {story.initialEstimate} puntos</span>
                                    </div>
                                )}
                                {story.finalEstimate && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        Estimación final: {story.finalEstimate} puntos
                                    </div>
                                )}
                                <button
                                    onClick={() => {/* TODO: Implementar votación */}}
                                    className="mt-4 w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    disabled={story.status === 'completed'}
                                >
                                    {story.status === 'completed' 
                                        ? 'Votación completada' 
                                        : 'Participar en votación'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay historias creadas</h3>
                        <p className="mt-2 text-gray-500">
                            {user?.role === 'project_manager' 
                                ? 'Crea una nueva historia para comenzar la estimación'
                                : 'El Project Manager aún no ha creado historias para esta sesión'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </main>

            {/* Create Story Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Historia de Usuario</h3>
                        <form onSubmit={handleCreateStory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        title='Título de la historia'
                                        value={newStory.title}
                                        onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        placeholder='Descripción de la historia'
                                        value={newStory.description}
                                        onChange={(e) => setNewStory({...newStory, description: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tiempo límite (minutos)
                                    </label>
                                    <input
                                        title='Tiempo límite en minutos'
                                        type="number"
                                        value={newStory.timeLimit}
                                        onChange={(e) => setNewStory({...newStory, timeLimit: parseInt(e.target.value)})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Estimación inicial (opcional)
                                    </label>
                                    <input
                                        title='Estimación inicial en puntos'
                                        type="number"
                                        value={newStory.initialEstimate || ''}
                                        onChange={(e) => setNewStory({
                                            ...newStory, 
                                            initialEstimate: e.target.value ? parseInt(e.target.value) : null
                                        })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewStory({
                                            title: '',
                                            description: '',
                                            timeLimit: 5,
                                            initialEstimate: null
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Crear Historia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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