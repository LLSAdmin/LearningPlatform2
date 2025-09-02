// Middleware para manejo de errores - Principio de Responsabilidad Única (SRP)
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            message: err.message,
            details: err.details
        });
    }

    // Error de base de datos
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            error: 'Error de base de datos',
            message: 'Error interno del servidor'
        });
    }

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Error de sintaxis JSON',
            message: 'El JSON enviado no es válido'
        });
    }

    // Error por defecto
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.stack : 'Error interno del servidor'
    });
};

module.exports = errorHandler;
