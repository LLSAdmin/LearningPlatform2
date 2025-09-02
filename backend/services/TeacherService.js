// Servicio para Teachers - Principio de Responsabilidad Única (SRP)
const Teacher = require('../models/Teacher');
const { getDatabase } = require('../../config/mongodb');

class TeacherService {
    constructor() {
        this.collectionName = 'Teachers';
    }

    // Obtener todos los profesores
    async getAllTeachers() {
        try {
            const db = getDatabase();
            const teachers = await db.collection(this.collectionName).find({}).toArray();
            return teachers.map(teacher => Teacher.fromObject(teacher));
        } catch (error) {
            console.error('Error getting all teachers:', error);
            throw new Error('Error al obtener los profesores');
        }
    }

    // Obtener profesor por ID
    async getTeacherById(id) {
        try {
            const db = getDatabase();
            const teacher = await db.collection(this.collectionName).findOne({ id: parseInt(id) });
            return teacher ? Teacher.fromObject(teacher) : null;
        } catch (error) {
            console.error('Error getting teacher by id:', error);
            throw new Error('Error al obtener el profesor');
        }
    }

    // Crear nuevo profesor
    async createTeacher(teacherData) {
        try {
            // Validar datos
            const teacher = new Teacher(teacherData);
            const validation = teacher.validate();
            
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            // Obtener siguiente ID
            const nextId = await this.getNextId();
            teacher.id = nextId;

            // Insertar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).insertOne(teacher.toObject());
            
            return Teacher.fromObject({ ...teacher.toObject(), _id: result.insertedId });
        } catch (error) {
            console.error('Error creating teacher:', error);
            throw error;
        }
    }

    // Actualizar profesor
    async updateTeacher(id, updateData) {
        try {
            // Validar datos
            const teacher = new Teacher(updateData);
            const validation = teacher.validate();
            
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            // Actualizar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).updateOne(
                { id: parseInt(id) },
                { $set: teacher.toObject() }
            );

            if (result.modifiedCount === 0) {
                throw new Error('Profesor no encontrado');
            }

            return await this.getTeacherById(id);
        } catch (error) {
            console.error('Error updating teacher:', error);
            throw error;
        }
    }

    // Eliminar profesor
    async deleteTeacher(id) {
        try {
            const db = getDatabase();
            const result = await db.collection(this.collectionName).deleteOne({ id: parseInt(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Profesor no encontrado');
            }

            return true;
        } catch (error) {
            console.error('Error deleting teacher:', error);
            throw error;
        }
    }

    // Obtener siguiente ID disponible
    async getNextId() {
        try {
            const db = getDatabase();
            const teachers = await db.collection(this.collectionName).find({}).toArray();
            return teachers.length > 0 ? Math.max(...teachers.map(t => t.id || 0)) + 1 : 1;
        } catch (error) {
            console.error('Error getting next ID:', error);
            return 1;
        }
    }
}

module.exports = TeacherService;
