// Rutas para Sessions - Principio de Responsabilidad Única (SRP)
const express = require('express');
const SessionController = require('../controllers/SessionController');

const router = express.Router();
const sessionController = new SessionController();

// Rutas para sesiones
router.get('/', sessionController.getAllSessions.bind(sessionController));
router.get('/user/:userId', sessionController.getSessionsByUser.bind(sessionController));
router.get('/:sessionId', sessionController.getSessionById.bind(sessionController));
router.post('/', sessionController.createSession.bind(sessionController));
router.put('/:sessionId', sessionController.updateSession.bind(sessionController));
router.delete('/:sessionId', sessionController.deleteSession.bind(sessionController));

module.exports = router;
