// Controlador para Teachers - Principio de Responsabilidad Única (SRP)
const TeacherService = require('../services/TeacherService');

class TeacherController {
    constructor() {
        this.teacherService = new TeacherService();
    }

    // Obtener todos los profesores
    async getAllTeachers(req, res) {
        try {
            const teachers = await this.teacherService.getAllTeachers();
            res.json(teachers);
        } catch (error) {
            console.error('Error in getAllTeachers:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener profesor por ID
    async getTeacherById(req, res) {
        try {
            const { id } = req.params;
            const teacher = await this.teacherService.getTeacherById(id);
            
            if (!teacher) {
                return res.status(404).json({ error: 'Profesor no encontrado' });
            }
            
            res.json(teacher);
        } catch (error) {
            console.error('Error in getTeacherById:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Crear nuevo profesor
    async createTeacher(req, res) {
        try {
            const teacherData = req.body;
            const newTeacher = await this.teacherService.createTeacher(teacherData);
            
            res.status(201).json({
                message: 'Profesor creado exitosamente',
                teacher: newTeacher
            });
        } catch (error) {
            console.error('Error in createTeacher:', error);
            
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

    // Actualizar profesor
    async updateTeacher(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedTeacher = await this.teacherService.updateTeacher(id, updateData);
            
            res.json({
                message: 'Profesor actualizado exitosamente',
                teacher: updatedTeacher
            });
        } catch (error) {
            console.error('Error in updateTeacher:', error);
            
            if (error.message.includes('Datos inválidos')) {
                return res.status(400).json({ 
                    error: 'Datos inválidos',
                    message: error.message 
                });
            }
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Profesor no encontrado',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Eliminar profesor
    async deleteTeacher(req, res) {
        try {
            const { id } = req.params;
            await this.teacherService.deleteTeacher(id);
            
            res.json({ 
                message: 'Profesor eliminado exitosamente',
                success: true 
            });
        } catch (error) {
            console.error('Error in deleteTeacher:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Profesor no encontrado',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }
}

module.exports = TeacherController;
