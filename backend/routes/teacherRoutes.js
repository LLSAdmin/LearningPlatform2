// Rutas para Teachers - Principio de Responsabilidad Única (SRP)
const express = require('express');
const TeacherController = require('../controllers/TeacherController');

const router = express.Router();
const teacherController = new TeacherController();

// Rutas para profesores
router.get('/', teacherController.getAllTeachers.bind(teacherController));
router.get('/:id', teacherController.getTeacherById.bind(teacherController));
router.post('/', teacherController.createTeacher.bind(teacherController));
router.put('/:id', teacherController.updateTeacher.bind(teacherController));
router.delete('/:id', teacherController.deleteTeacher.bind(teacherController));

module.exports = router;
