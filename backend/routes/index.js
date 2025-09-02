// Archivo principal de rutas - Principio de Responsabilidad Única (SRP)
const express = require('express');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const classRoutes = require('./classRoutes');
const sessionRoutes = require('./sessionRoutes');

const router = express.Router();

// Rutas principales
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/sessions', sessionRoutes);

// Ruta de salud del backend
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend API funcionando correctamente',
        timestamp: new Date().toISOString(),
        endpoints: {
            teachers: '/api/teachers',
            students: '/api/students',
            classes: '/api/classes',
            sessions: '/api/sessions'
        }
    });
});

module.exports = router;
