// Controlador para Classes - Principio de Responsabilidad Única (SRP)
const ClassService = require('../services/ClassService');

class ClassController {
    constructor() {
        this.classService = new ClassService();
    }

    // Obtener todas las clases
    async getAllClasses(req, res) {
        try {
            const classes = await this.classService.getAllClasses();
            res.json(classes);
        } catch (error) {
            console.error('Error in getAllClasses:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener clase por ID
    async getClassById(req, res) {
        try {
            const { id } = req.params;
            const classItem = await this.classService.getClassById(id);
            
            if (!classItem) {
                return res.status(404).json({ error: 'Clase no encontrada' });
            }
            
            res.json(classItem);
        } catch (error) {
            console.error('Error in getClassById:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Crear nueva clase
    async createClass(req, res) {
        try {
            const classData = req.body;
            const newClass = await this.classService.createClass(classData);
            
            res.status(201).json({
                message: 'Clase creada exitosamente',
                class: newClass
            });
        } catch (error) {
            console.error('Error in createClass:', error);
            
            if (error.message.includes('Datos inválidos')) {
                return res.status(400).json({ 
                    error: 'Datos inválidos',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Actualizar clase
    async updateClass(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedClass = await this.classService.updateClass(id, updateData);
            
            res.json({
                message: 'Clase actualizada exitosamente',
                class: updatedClass
            });
        } catch (error) {
            console.error('Error in updateClass:', error);
            
            if (error.message.includes('Datos inválidos')) {
                return res.status(400).json({ 
                    error: 'Datos inválidos',
                    message: error.message 
                });
            }
            
            if (error.message.includes('no encontrada')) {
                return res.status(404).json({ 
                    error: 'Clase no encontrada',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Eliminar clase
    async deleteClass(req, res) {
        try {
            const { id } = req.params;
            await this.classService.deleteClass(id);
            
            res.json({ 
                message: 'Clase eliminada exitosamente',
                success: true 
            });
        } catch (error) {
            console.error('Error in deleteClass:', error);
            
            if (error.message.includes('no encontrada')) {
                return res.status(404).json({ 
                    error: 'Clase no encontrada',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener clases por estado
    async getClassesByStatus(req, res) {
        try {
            const { status } = req.params;
            const classes = await this.classService.getClassesByStatus(status);
            
            res.json({
                status,
                count: classes.length,
                classes
            });
        } catch (error) {
            console.error('Error in getClassesByStatus:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener clases por fecha
    async getClassesByDate(req, res) {
        try {
            const { date } = req.params;
            const classes = await this.classService.getClassesByDate(date);
            
            res.json({
                date,
                count: classes.length,
                classes
            });
        } catch (error) {
            console.error('Error in getClassesByDate:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }
}

module.exports = ClassController;
