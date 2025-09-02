// Servidor principal - Solo se encarga del startup y configuración inicial
const { connectToMongoDB, closeConnection } = require('./config/mongodb');
const { createServer } = require('./app');

require('dotenv').config();

// Variables globales para el servidor
let server = null;
let socketService = null;

// Función para iniciar el servidor
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        // Conectar a MongoDB
        await connectToMongoDB();
        console.log('✅ Conectado a MongoDB Atlas');
        
        // Crear servidor y aplicación
        const { server: httpServer, socketService: socket } = createServer();
        server = httpServer;
        socketService = socket;
        
        // Obtener puerto
        const PORT = process.env.PORT || 3000;
        
        // Iniciar servidor HTTP
        server.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
            console.log(`🌐 Visita http://localhost:${PORT} para acceder a la aplicación`);
            console.log(`📊 Base de datos: LanguageSchool`);
            console.log(`🔌 Socket.IO habilitado para comunicación en tiempo real`);
        });
        
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}

// Función para cerrar el servidor
async function stopServer() {
    try {
        console.log('🛑 Cerrando servidor...');
        
        if (server) {
            server.close();
            console.log('✅ Servidor HTTP cerrado');
        }
        
        await closeConnection();
        console.log('✅ Conexión a MongoDB cerrada');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error cerrando el servidor:', error);
        process.exit(1);
    }
}

// Manejar señales de terminación
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    stopServer();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    stopServer();
});

// Iniciar el servidor
startServer();