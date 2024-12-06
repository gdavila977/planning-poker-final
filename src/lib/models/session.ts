// Ruta del archivo: /src/lib/models/session.ts

import { WithId, Document } from 'mongodb';

// Interface para la sesión en la base de datos
export interface PlanningSession {
    sessionId: string;
    name: string;
    description: string;
    createdBy: string;
    participants: string[];
    createdAt: string;
    status: 'active' | 'completed' | 'cancelled';
}

// Tipo que combina PlanningSession con los tipos de MongoDB
export type SessionDocument = WithId<Document> & PlanningSession;

export interface SessionResponse {
    success: boolean;
    message: string;
    sessions?: SessionDocument[];
}

export interface CreateSessionRequest {
    name: string;
    description: string;
    participants: string[]; 
    status?: 'active' | 'completed' | 'cancelled'; 
}