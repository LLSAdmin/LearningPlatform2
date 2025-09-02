// Controlador para Sessions - Principio de Responsabilidad Única (SRP)
const SessionService = require('../services/SessionService');

class SessionController {
    constructor() {
        this.sessionService = new SessionService();
    }

    // Obtener todas las sesiones
    async getAllSessions(req, res) {
        try {
            const sessions = await this.sessionService.getAllSessions();
            res.json(sessions);
        } catch (error) {
            console.error('Error in getAllSessions:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener sesión por ID
    async getSessionById(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await this.sessionService.getSession(sessionId);
            
            if (!session) {
                return res.status(404).json({ error: 'Sesión no encontrada' });
            }
            
            res.json(session);
        } catch (error) {
            console.error('Error in getSessionById:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Crear nueva sesión
    async createSession(req, res) {
        try {
            const sessionData = req.body;
            const newSession = await this.sessionService.saveSession(sessionData);
            
            res.status(201).json({
                message: 'Sesión creada exitosamente',
                session: newSession
            });
        } catch (error) {
            console.error('Error in createSession:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Actualizar sesión
    async updateSession(req, res) {
        try {
            const { sessionId } = req.params;
            const updateData = req.body;
            
            const success = await this.sessionService.updateSession(sessionId, updateData);
            
            if (!success) {
                return res.status(404).json({ 
                    error: 'Sesión no encontrada',
                    message: 'No se pudo actualizar la sesión' 
                });
            }
            
            res.json({
                message: 'Sesión actualizada exitosamente',
                success: true
            });
        } catch (error) {
            console.error('Error in updateSession:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Eliminar sesión
    async deleteSession(req, res) {
        try {
            const { sessionId } = req.params;
            const success = await this.sessionService.deleteSession(sessionId);
            
            if (!success) {
                return res.status(404).json({ 
                    error: 'Sesión no encontrada',
                    message: 'No se pudo eliminar la sesión' 
                });
            }
            
            res.json({ 
                message: 'Sesión eliminada exitosamente',
                success: true 
            });
        } catch (error) {
            console.error('Error in deleteSession:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener sesiones por usuario
    async getSessionsByUser(req, res) {
        try {
            const { userId } = req.params;
            const sessions = await this.sessionService.getSessionsByUser(userId);
            
            res.json({
                userId,
                count: sessions.length,
                sessions
            });
        } catch (error) {
            console.error('Error in getSessionsByUser:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }
}

module.exports = SessionController;
