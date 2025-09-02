// Servicio para Teachers - Principio de Responsabilidad Única (SRP)
const Teacher = require('../models/Teacher');
const { getDatabase } = require('../../config/mongodb');
const { ObjectId } = require('mongodb');

class TeacherService {
    constructor() {
        this.collectionName = 'Teachers'; // Usar minúsculas para nueva colección
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
            let query = {};
            
            // Manejar tanto ObjectId como string ID
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            } else {
                query = { id: id };
            }
            
            const teacher = await db.collection(this.collectionName).findOne(query);
            return teacher ? Teacher.fromObject(teacher) : null;
        } catch (error) {
            console.error('Error getting teacher by id:', error);
            throw new Error('Error al obtener el profesor');
        }
    }

    // Crear nuevo profesor
    async createTeacher(teacherData) {
        try {
            // Crear instancia del Teacher usando el método estático
            const teacher = Teacher.create(teacherData);

            // Insertar en base de datos (MongoDB generará automáticamente el _id)
            const db = getDatabase();
            const result = await db.collection(this.collectionName).insertOne(teacher.toObject());
            
            // Retornar el teacher creado con el _id de MongoDB
            return Teacher.fromObject({ 
                ...teacher.toObject(), 
                _id: result.insertedId 
            });
        } catch (error) {
            console.error('Error creating teacher:', error);
            throw error;
        }
    }

    // Actualizar profesor
    async updateTeacher(id, updateData) {
        try {
            // Crear instancia del Teacher para validar
            const teacher = Teacher.create(updateData);

            // Preparar query para actualizar
            let query = {};
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            } else {
                query = { id: id };
            }

            // Actualizar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).updateOne(
                query,
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
            
            // Preparar query para eliminar
            let query = {};
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            } else {
                query = { id: id };
            }
            
            const result = await db.collection(this.collectionName).deleteOne(query);
            
            if (result.deletedCount === 0) {
                throw new Error('Profesor no encontrado');
            }

            return true;
        } catch (error) {
            console.error('Error deleting teacher:', error);
            throw error;
        }
    }

    // Buscar profesores por email
    async getTeacherByEmail(email) {
        try {
            const db = getDatabase();
            const teacher = await db.collection(this.collectionName).findOne({ email: email });
            return teacher ? Teacher.fromObject(teacher) : null;
        } catch (error) {
            console.error('Error getting teacher by email:', error);
            throw new Error('Error al buscar profesor por email');
        }
    }

    // Buscar profesores por nombre
    async searchTeachersByName(name) {
        try {
            const db = getDatabase();
            const teachers = await db.collection(this.collectionName).find({
                $or: [
                    { name: { $regex: name, $options: 'i' } },
                    { lastname: { $regex: name, $options: 'i' } }
                ]
            }).toArray();
            
            return teachers.map(teacher => Teacher.fromObject(teacher));
        } catch (error) {
            console.error('Error searching teachers by name:', error);
            throw new Error('Error al buscar profesores por nombre');
        }
    }

    // Obtener estadísticas de profesores
    async getTeacherStats() {
        try {
            const db = getDatabase();
            const totalTeachers = await db.collection(this.collectionName).countDocuments();
            
            // Profesores creados en el último mes
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            
            const recentTeachers = await db.collection(this.collectionName).countDocuments({
                created: { $gte: lastMonth.toISOString() }
            });

            return {
                total: totalTeachers,
                recent: recentTeachers
            };
        } catch (error) {
            console.error('Error getting teacher stats:', error);
            throw new Error('Error al obtener estadísticas de profesores');
        }
    }
}

module.exports = new TeacherService();