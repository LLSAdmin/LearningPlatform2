// Rutas para Students - Principio de Responsabilidad Única (SRP)
const express = require('express');
const studentController = require('../controllers/StudentController');

const router = express.Router();

// Rutas para estudiantes
router.get('/', studentController.getAllStudents.bind(studentController));
router.get('/level/:level', studentController.getStudentsByLevel.bind(studentController));
router.get('/:id', studentController.getStudentById.bind(studentController));
router.post('/', studentController.createStudent.bind(studentController));
router.put('/:id', studentController.updateStudent.bind(studentController));
router.delete('/:id', studentController.deleteStudent.bind(studentController));

// Rutas adicionales
router.get('/email/:email', studentController.getStudentByEmail.bind(studentController));
router.get('/search/name', studentController.searchStudentsByName.bind(studentController));
router.get('/stats/overview', studentController.getStudentStats.bind(studentController));

module.exports = router;
