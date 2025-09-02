// Rutas para Classes - Principio de Responsabilidad Única (SRP)
const express = require('express');
const ClassController = require('../controllers/ClassController');

const router = express.Router();
const classController = new ClassController();

// Rutas para clases
router.get('/', classController.getAllClasses.bind(classController));
router.get('/status/:status', classController.getClassesByStatus.bind(classController));
router.get('/date/:date', classController.getClassesByDate.bind(classController));
router.get('/:id', classController.getClassById.bind(classController));
router.post('/', classController.createClass.bind(classController));
router.put('/:id', classController.updateClass.bind(classController));
router.delete('/:id', classController.deleteClass.bind(classController));

module.exports = router;
