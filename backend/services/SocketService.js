// Servicio para Socket.IO - Principio de Responsabilidad Única (SRP)
const SessionService = require('./SessionService');

class SocketService {
    constructor(io) {
        this.io = io;
        this.sessionService = new SessionService();
        this.sessions = new Map();
        this.userSessions = new Map();
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Usuario conectado: ${socket.id}`);

            // Manejar inicio de sesión
            socket.on('start_session', async (data) => {
                try {
                    const { userId, userName, userRole } = data;
                    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    const sessionData = {
                        id: sessionId,
                        userId,
                        userName,
                        userRole,
                        startTime: new Date().toISOString(),
                        status: 'active',
                        socketId: socket.id
                    };

                    // Guardar en memoria
                    this.sessions.set(sessionId, sessionData);
                    this.userSessions.set(userId, sessionId);
                    socket.sessionId = sessionId;
                    socket.userId = userId;

                    // Guardar en base de datos
                    await this.sessionService.saveSession(sessionData);

                    // Unir a sala de sesión
                    socket.join(sessionId);

                    // Confirmar inicio de sesión
                    socket.emit('session_started', {
                        sessionId,
                        message: 'Sesión iniciada correctamente'
                    });

                    console.log(`✅ Sesión iniciada: ${sessionId} para usuario: ${userName}`);
                } catch (error) {
                    console.error('Error starting session:', error);
                    socket.emit('error', { message: 'Error al iniciar sesión' });
                }
            });

            // Manejar unirse a sesión existente
            socket.on('join_session', async (data) => {
                try {
                    const { sessionId } = data;
                    const session = this.sessions.get(sessionId);
                    
                    if (!session) {
                        socket.emit('error', { message: 'Sesión no encontrada' });
                        return;
                    }

                    socket.sessionId = sessionId;
                    socket.join(sessionId);
                    
                    socket.emit('session_joined', {
                        sessionId,
                        message: 'Te has unido a la sesión'
                    });

                    console.log(`👥 Usuario ${socket.id} se unió a sesión: ${sessionId}`);
                } catch (error) {
                    console.error('Error joining session:', error);
                    socket.emit('error', { message: 'Error al unirse a la sesión' });
                }
            });

            // Manejar mensajes de chat
            socket.on('chat_message', (data) => {
                try {
                    const { message, sessionId } = data;
                    const session = this.sessions.get(sessionId);
                    
                    if (!session) {
                        socket.emit('error', { message: 'Sesión no encontrada' });
                        return;
                    }

                    const messageData = {
                        id: `msg_${Date.now()}`,
                        sessionId,
                        userId: socket.userId,
                        message,
                        timestamp: new Date().toISOString(),
                        socketId: socket.id
                    };

                    // Enviar mensaje a todos en la sesión
                    this.io.to(sessionId).emit('new_message', messageData);
                    
                    console.log(`💬 Mensaje en sesión ${sessionId}: ${message}`);
                } catch (error) {
                    console.error('Error handling chat message:', error);
                    socket.emit('error', { message: 'Error al enviar mensaje' });
                }
            });

            // Manejar eventos de clase
            socket.on('class_event', (data) => {
                try {
                    const { eventType, sessionId, eventData } = data;
                    const session = this.sessions.get(sessionId);
                    
                    if (!session) {
                        socket.emit('error', { message: 'Sesión no encontrada' });
                        return;
                    }

                    const event = {
                        id: `event_${Date.now()}`,
                        sessionId,
                        eventType,
                        eventData,
                        timestamp: new Date().toISOString(),
                        userId: socket.userId
                    };

                    // Enviar evento a todos en la sesión
                    this.io.to(sessionId).emit('class_event_received', event);
                    
                    console.log(`📚 Evento de clase en sesión ${sessionId}: ${eventType}`);
                } catch (error) {
                    console.error('Error handling class event:', error);
                    socket.emit('error', { message: 'Error al procesar evento de clase' });
                }
            });

            // Manejar desconexión
            socket.on('disconnect', async () => {
                try {
                    if (socket.sessionId) {
                        const session = this.sessions.get(socket.sessionId);
                        if (session) {
                            // Actualizar sesión en base de datos
                            await this.sessionService.updateSession(socket.sessionId, {
                                endTime: new Date().toISOString(),
                                status: 'ended'
                            });

                            // Limpiar de memoria
                            this.sessions.delete(socket.sessionId);
                            if (socket.userId) {
                                this.userSessions.delete(socket.userId);
                            }

                            console.log(`🔌 Sesión terminada: ${socket.sessionId}`);
                        }
                    }
                    
                    console.log(`👋 Usuario desconectado: ${socket.id}`);
                } catch (error) {
                    console.error('Error handling disconnect:', error);
                }
            });
        });
    }

    // Método para obtener estadísticas
    getStats() {
        return {
            activeSessions: this.sessions.size,
            connectedUsers: this.io.engine.clientsCount,
            sessions: Array.from(this.sessions.values())
        };
    }

    // Método para enviar mensaje a sesión específica
    sendToSession(sessionId, event, data) {
        this.io.to(sessionId).emit(event, data);
    }

    // Método para enviar mensaje a todos
    broadcast(event, data) {
        this.io.emit(event, data);
    }
}

module.exports = SocketService;
