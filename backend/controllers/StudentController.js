// Controlador para Students - Principio de Responsabilidad Única (SRP)
const StudentService = require('../services/StudentService');

class StudentController {
    // Obtener todos los estudiantes
    async getAllStudents(req, res) {
        try {
            const students = await StudentService.getAllStudents();
            res.json(students);
        } catch (error) {
            console.error('Error in getAllStudents:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener estudiante por ID
    async getStudentById(req, res) {
        try {
            const { id } = req.params;
            const student = await StudentService.getStudentById(id);
            
            if (!student) {
                return res.status(404).json({ error: 'Estudiante no encontrado' });
            }
            
            res.json(student);
        } catch (error) {
            console.error('Error in getStudentById:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Crear nuevo estudiante
    async createStudent(req, res) {
        try {
            const { full_name, level, email, phone } = req.body;
            
            // Validar que se envíen los campos requeridos
            if (!full_name || !level) {
                return res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Se requieren los campos: full_name, level'
                });
            }

            const studentData = { full_name, level, email, phone };
            const newStudent = await StudentService.createStudent(studentData);
            
            res.status(201).json({
                message: 'Estudiante creado exitosamente',
                student: newStudent
            });
        } catch (error) {
            console.error('Error in createStudent:', error);
            
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

    // Actualizar estudiante
    async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const { full_name, level, email, phone } = req.body;
            
            // Validar que se envíen los campos requeridos
            if (!full_name || !level) {
                return res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Se requieren los campos: full_name, level'
                });
            }

            const updateData = { full_name, level, email, phone };
            const updatedStudent = await StudentService.updateStudent(id, updateData);
            
            res.json({
                message: 'Estudiante actualizado exitosamente',
                student: updatedStudent
            });
        } catch (error) {
            console.error('Error in updateStudent:', error);
            
            if (error.message.includes('Datos inválidos')) {
                return res.status(400).json({ 
                    error: 'Datos inválidos',
                    message: error.message 
                });
            }
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Estudiante no encontrado',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Eliminar estudiante
    async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            await StudentService.deleteStudent(id);
            
            res.json({ 
                message: 'Estudiante eliminado exitosamente',
                success: true 
            });
        } catch (error) {
            console.error('Error in deleteStudent:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Estudiante no encontrado',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener estudiantes por nivel
    async getStudentsByLevel(req, res) {
        try {
            const { level } = req.params;
            const students = await StudentService.getStudentsByLevel(level);
            
            res.json({
                level,
                count: students.length,
                students
            });
        } catch (error) {
            console.error('Error in getStudentsByLevel:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Buscar estudiantes por email
    async getStudentByEmail(req, res) {
        try {
            const { email } = req.params;
            const student = await StudentService.getStudentByEmail(email);
            
            if (!student) {
                return res.status(404).json({ error: 'Estudiante no encontrado' });
            }
            
            res.json(student);
        } catch (error) {
            console.error('Error in getStudentByEmail:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Buscar estudiantes por nombre
    async searchStudentsByName(req, res) {
        try {
            const { name } = req.query;
            
            if (!name) {
                return res.status(400).json({
                    error: 'Parámetro requerido',
                    message: 'Se requiere el parámetro "name" para buscar'
                });
            }

            const students = await StudentService.searchStudentsByName(name);
            res.json(students);
        } catch (error) {
            console.error('Error in searchStudentsByName:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }

    // Obtener estadísticas de estudiantes
    async getStudentStats(req, res) {
        try {
            const stats = await StudentService.getStudentStats();
            res.json(stats);
        } catch (error) {
            console.error('Error in getStudentStats:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        }
    }
}

module.exports = new StudentController();