// Controlador para Students - Principio de Responsabilidad Única (SRP)
const StudentService = require('../services/StudentService');

class StudentController {
    constructor() {
        this.studentService = new StudentService();
    }

    // Obtener todos los estudiantes
    async getAllStudents(req, res) {
        try {
            const students = await this.studentService.getAllStudents();
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
            const student = await this.studentService.getStudentById(id);
            
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
            const studentData = req.body;
            const newStudent = await this.studentService.createStudent(studentData);
            
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
            const updateData = req.body;
            
            const updatedStudent = await this.studentService.updateStudent(id, updateData);
            
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
            await this.studentService.deleteStudent(id);
            
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
            const students = await this.studentService.getStudentsByLevel(level);
            
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
}

module.exports = StudentController;
