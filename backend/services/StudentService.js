// Servicio para Students - Principio de Responsabilidad Única (SRP)
const Student = require('../models/Student');
const { getDatabase } = require('../../config/mongodb');

class StudentService {
    constructor() {
        this.collectionName = 'Students';
    }

    // Obtener todos los estudiantes
    async getAllStudents() {
        try {
            const db = getDatabase();
            const students = await db.collection(this.collectionName).find({}).toArray();
            return students.map(student => Student.fromObject(student));
        } catch (error) {
            console.error('Error getting all students:', error);
            throw new Error('Error al obtener los estudiantes');
        }
    }

    // Obtener estudiante por ID
    async getStudentById(id) {
        try {
            const db = getDatabase();
            const student = await db.collection(this.collectionName).findOne({ id: parseInt(id) });
            return student ? Student.fromObject(student) : null;
        } catch (error) {
            console.error('Error getting student by id:', error);
            throw new Error('Error al obtener el estudiante');
        }
    }

    // Crear nuevo estudiante
    async createStudent(studentData) {
        try {
            // Validar datos
            const student = new Student(studentData);
            const validation = student.validate();
            
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            // Obtener siguiente ID
            const nextId = await this.getNextId();
            student.id = nextId;

            // Insertar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).insertOne(student.toObject());
            
            return Student.fromObject({ ...student.toObject(), _id: result.insertedId });
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    }

    // Actualizar estudiante
    async updateStudent(id, updateData) {
        try {
            // Validar datos
            const student = new Student(updateData);
            const validation = student.validate();
            
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            // Actualizar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).updateOne(
                { id: parseInt(id) },
                { $set: student.toObject() }
            );

            if (result.modifiedCount === 0) {
                throw new Error('Estudiante no encontrado');
            }

            return await this.getStudentById(id);
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    }

    // Eliminar estudiante
    async deleteStudent(id) {
        try {
            const db = getDatabase();
            const result = await db.collection(this.collectionName).deleteOne({ id: parseInt(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Estudiante no encontrado');
            }

            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }

    // Obtener estudiantes por nivel
    async getStudentsByLevel(level) {
        try {
            const db = getDatabase();
            const students = await db.collection(this.collectionName).find({ level }).toArray();
            return students.map(student => Student.fromObject(student));
        } catch (error) {
            console.error('Error getting students by level:', error);
            throw new Error('Error al obtener estudiantes por nivel');
        }
    }

    // Obtener siguiente ID disponible
    async getNextId() {
        try {
            const db = getDatabase();
            const students = await db.collection(this.collectionName).find({}).toArray();
            return students.length > 0 ? Math.max(...students.map(s => s.id || 0)) + 1 : 1;
        } catch (error) {
            console.error('Error getting next ID:', error);
            return 1;
        }
    }
}

module.exports = StudentService;
