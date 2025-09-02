// Controlador para Teachers - Principio de Responsabilidad Única (SRP)
const TeacherService = require('../services/TeacherService');

class TeacherController {
    // Obtener todos los profesores
    async getAllTeachers(req, res) {
        try {
            const teachers = await TeacherService.getAllTeachers();
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
            const teacher = await TeacherService.getTeacherById(id);
            
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
            const { name, lastname, email } = req.body;
            
            // Validar que se envíen los campos requeridos
            if (!name || !lastname || !email) {
                return res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Se requieren los campos: name, lastname, email'
                });
            }

            const teacherData = { name, lastname, email };
            const newTeacher = await TeacherService.createTeacher(teacherData);
            
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
            const { name, lastname, email } = req.body;
            
            // Validar que se envíen los campos requeridos
            if (!name || !lastname || !email) {
                return res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Se requieren los campos: name, lastname, email'
                });
            }

            const updateData = { name, lastname, email };
            const updatedTeacher = await TeacherService.updateTeacher(id, updateData);
            
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
            await TeacherService.deleteTeacher(id);
            
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

    // Buscar profesores por email
    async getTeacherByEmail(req, res) {
        try {
            const { email } = req.params;
            const teacher = await TeacherService.getTeacherByEmail(email);
            
            if (!teacher) {
                return res.status(404).json({ error: 'Profesor no encontrado' });
            }
            
            res.json(teacher);
        } catch (error) {
            console.error('Error in getTeacherByEmail:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Buscar profesores por nombre
    async searchTeachersByName(req, res) {
        try {
            const { name } = req.query;
            
            if (!name) {
                return res.status(400).json({
                    error: 'Parámetro requerido',
                    message: 'Se requiere el parámetro "name" para buscar'
                });
            }

            const teachers = await TeacherService.searchTeachersByName(name);
            res.json(teachers);
        } catch (error) {
            console.error('Error in searchTeachersByName:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener estadísticas de profesores
    async getTeacherStats(req, res) {
        try {
            const stats = await TeacherService.getTeacherStats();
            res.json(stats);
        } catch (error) {
            console.error('Error in getTeacherStats:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }
}

module.exports = new TeacherController();