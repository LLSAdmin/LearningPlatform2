// Rutas para Teachers - Principio de Responsabilidad Única (SRP)
const express = require('express');
const teacherController = require('../controllers/TeacherController');

const router = express.Router();

// Rutas para profesores
router.get('/', teacherController.getAllTeachers.bind(teacherController));
router.get('/:id', teacherController.getTeacherById.bind(teacherController));
router.post('/', teacherController.createTeacher.bind(teacherController));
router.put('/:id', teacherController.updateTeacher.bind(teacherController));
router.delete('/:id', teacherController.deleteTeacher.bind(teacherController));

// Rutas adicionales
router.get('/email/:email', teacherController.getTeacherByEmail.bind(teacherController));
router.get('/search/name', teacherController.searchTeachersByName.bind(teacherController));
router.get('/stats/overview', teacherController.getTeacherStats.bind(teacherController));

module.exports = router;
