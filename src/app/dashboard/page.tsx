// Ruta del archivo: /src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/authService';
import { SessionService } from '@/lib/services/sessionService';
import { UserService } from '@/lib/services/userService';
import { SessionDocument } from '@/lib/models/session';
import { User } from '@/lib/models/auth';
import { 
    LogOut, 
    Plus, 
    Users, 
    Clock,
    Calendar,
} from 'lucide-react';
import { Toast, ToastType } from '@/components/ui/Toast';

export default function DashboardPage() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState(AuthService.getUserSession());
    const [sessions, setSessions] = useState<SessionDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSession, setNewSession] = useState({ name: '', description: '' });
    const [developers, setDevelopers] = useState<User[]>([]);
    const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const sessionsPerPage = 6;
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<SessionDocument | null>(null);
    const [editSession, setEditSession] = useState({ name: '', description: '' });

    useEffect(() => {
        loadSessions();
        if (user?.role === 'project_manager') {
            loadDevelopers();
        }
    }, [user?.role]);

    const loadSessions = async () => {
        setIsLoading(true);
        try {
            const response = await SessionService.getActiveSessions();
            if (response.success && response.sessions) {
                setSessions(response.sessions);
            }
        } catch (error) {
            console.error('Error al cargar sesiones:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDevelopers = async () => {
        try {
            const devs = await UserService.getDevelopers();
            setDevelopers(devs);
        } catch (error) {
            console.error('Error al cargar desarrolladores:', error);
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        router.push('/login');
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = AuthService.getUserSession();
            if (!user) {
                setToast({ message: 'Error: Usuario no autenticado', type: 'error' });
                return;
            }
    
            setToast({ message: 'Creando sesión...', type: 'success' });
            
            const sessionData = {
                ...newSession,
                participants: selectedDevelopers
            };
    
            const response = await SessionService.createSession(sessionData);
            
            if (response.success) {
                setShowCreateModal(false);
                await loadSessions();
                setNewSession({ name: '', description: '' });
                setSelectedDevelopers([]);
                setToast({ message: 'Sesión creada exitosamente', type: 'success' });
            } else {
                setToast({ message: response.message || 'Error al crear la sesión', type: 'error' });
            }
        } catch (error) {
            console.error('Error al crear sesión:', error);
            setToast({ message: 'Error al crear la sesión', type: 'error' });
        }
    };

    const handleEditSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;
    
        try {
            const response = await SessionService.updateSession(
                selectedSession.sessionId,
                {
                    name: editSession.name,
                    description: editSession.description,
                    participants: selectedDevelopers
                }
            );
    
            if (response.success) {
                setShowEditModal(false);
                await loadSessions();
                setToast({ message: 'Sesión actualizada exitosamente', type: 'success' });
            } else {
                setToast({ message: response.message || 'Error al actualizar la sesión', type: 'error' });
            }
        } catch (error) {
            console.error('Error al actualizar sesión:', error);
            setToast({ message: 'Error al actualizar la sesión', type: 'error' });
        }
    };

    const handleDeleteSession = async () => {
        if (!selectedSession) return;
    
        try {
            const response = await SessionService.deleteSession(selectedSession.sessionId);
    
            if (response.success) {
                setShowDeleteModal(false);
                await loadSessions();
                setToast({ message: 'Sesión eliminada exitosamente', type: 'success' });
            } else {
                setToast({ message: response.message || 'Error al eliminar la sesión', type: 'error' });
            }
        } catch (error) {
            console.error('Error al eliminar sesión:', error);
            setToast({ message: 'Error al eliminar la sesión', type: 'error' });
        }
    };

    // Función para mostrar el toast
    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    const showToast = (message: string, type: ToastType) => { //ACTUALMENTE NO SE ESTA USANDO EL SHOWTOAST PERO NO LO ELIMINO POR SI MAS ADELTANTE SE OCUPA
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Calculamos las sesiones para la página actual
    const getCurrentPageSessions = () => {
        const startIndex = (currentPage - 1) * sessionsPerPage;
        const endIndex = startIndex + sessionsPerPage;
        return sessions.slice(startIndex, endIndex);
    };

    // Calculamos el total de páginas
    const totalPages = Math.ceil(sessions.length / sessionsPerPage);



    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-900">Planning Poker</h1>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {user?.role === 'project_manager' ? 'Project Manager' : 'Developer'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Bienvenido, {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <LogOut className="h-5 w-5 mr-1" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>
    
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Sesiones Activas</h2>
                    {user?.role === 'project_manager' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nueva Sesión
                        </button>
                    )}
                </div>
    
                {/* Sessions Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando sesiones...</p>
                    </div>
                ) : sessions.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getCurrentPageSessions().map((session) => (
                                <div
                                    key={session.sessionId}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium text-gray-900">{session.name}</h3>
                                        {user?.role === 'project_manager' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSession(session);
                                                        setEditSession({
                                                            name: session.name,
                                                            description: session.description
                                                        });
                                                        setSelectedDevelopers(
                                                            session.participants.filter(id => id !== user.userId)
                                                        );
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-blue-600"
                                                    title="Editar sesión"
                                                >
                                                    <span className="sr-only">Editar</span>
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSession(session);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-red-600"
                                                    title="Eliminar sesión"
                                                >
                                                    <span className="sr-only">Eliminar</span>
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-gray-600">{session.description}</p>
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span>{session.participants.length} participantes</span>
                                        <Clock className="h-4 w-4 ml-4 mr-2" />
                                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('currentSession', JSON.stringify(session));
                                            router.push('/stories');
                                        }}
                                        className="mt-4 w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Ver historias de la sesión
                                    </button>
                                </div>
                            ))}
                        </div>
    
                        {/* Paginación */}
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
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay sesiones activas</h3>
                        <p className="mt-2 text-gray-500">
                            {user?.role === 'project_manager' 
                                ? 'Crea una nueva sesión para comenzar'
                                : 'No hay sesiones disponibles en este momento'}
                        </p>
                    </div>
                )}
            </main>
    
            {/* Create Session Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Sesión</h3>
                        <form onSubmit={handleCreateSession}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre de la sesión
                                    </label>
                                    <input
                                        type="text"
                                        title="descripcion de la sesión"
                                        value={newSession.name}
                                        onChange={(e) => setNewSession({...newSession, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        title="Descripción de la sesión"
                                        value={newSession.description}
                                        onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Participantes
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                                        {developers.map((dev) => (
                                            <label key={dev.userId} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDevelopers.includes(dev.userId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedDevelopers([...selectedDevelopers, dev.userId]);
                                                        } else {
                                                            setSelectedDevelopers(
                                                                selectedDevelopers.filter(id => id !== dev.userId)
                                                            );
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                    title="Seleccionar participante"
                                                />
                                                <span className="text-sm text-gray-700">{dev.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedDevelopers([]);
                                        setNewSession({ name: '', description: '' });
                                    }}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                    disabled={selectedDevelopers.length === 0}
                                >
                                    Crear Sesión
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
    
            {/* Edit Session Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Sesión</h3>
                        <form onSubmit={handleEditSession}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre de la sesión
                                    </label>
                                    <input
                                        type="text"
                                        title='Nombre de la sesión'
                                        value={editSession.name}
                                        onChange={(e) => setEditSession({...editSession, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        placeholder='Descripción de la sesión'
                                        value={editSession.description}
                                        onChange={(e) => setEditSession({...editSession, description: e.target.value})}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Participantes
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                                        {developers.map((dev) => (
                                            <label key={dev.userId} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDevelopers.includes(dev.userId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedDevelopers([...selectedDevelopers, dev.userId]);
                                                        } else {
                                                            setSelectedDevelopers(
                                                                selectedDevelopers.filter(id => id !== dev.userId)
                                                            );
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">{dev.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteSession}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
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
            