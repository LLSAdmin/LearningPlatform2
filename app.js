// Configuración de la aplicación Express - Principio de Responsabilidad Única (SRP)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

// Importar middleware y rutas
const backendRoutes = require('./backend/routes');
const errorHandler = require('./backend/middleware/errorHandler');
const requestLogger = require('./backend/middleware/requestLogger');
const SocketService = require('./backend/services/SocketService');

// Configurar aplicación Express
function createApp() {
    const app = express();
    
    // Middleware básico
    app.use(cors());
    app.use(express.json());
    app.use(requestLogger);
    app.use(express.static(path.join(__dirname, './')));

    // Rutas del backend API
    app.use('/api', backendRoutes);

    // Rutas estáticas
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.get('/dashboard', (req, res) => {
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    });

    app.get('/classroom', (req, res) => {
        res.sendFile(path.join(__dirname, 'classroom.html'));
    });

    // Legacy compatibility endpoints
    app.post('/api/auth.php', (req, res) => {
        res.json({ 
            id: 'admin-1', 
            username: 'admin', 
            name: 'Administrator', 
            email: 'admin@leonorlanguageschool.com', 
            role: 'admin' 
        });
    });

    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            let dbStatus = 'disconnected';
            try {
                const { getDatabase } = require('./config/mongodb');
                const db = getDatabase();
                await db.admin().ping();
                dbStatus = 'connected';
            } catch (error) {
                console.error('Database health check failed:', error.message);
            }

            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                database: dbStatus,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            });
        } catch (error) {
            res.status(500).json({
                status: 'ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Manejo de errores
    app.use(errorHandler);

    return app;
}

// Configurar servidor HTTP y Socket.IO
function createServer() {
    const app = createApp();
    const server = http.createServer(app);
    
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Inicializar servicio de Socket.IO
    const socketService = new SocketService(io);

    return { app, server, io, socketService };
}

module.exports = { createApp, createServer };
