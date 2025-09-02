// Servicio para Students - Principio de Responsabilidad Única (SRP)
const Student = require('../models/Student');
const { getDatabase } = require('../../config/mongodb');
const { ObjectId } = require('mongodb');

class StudentService {
    constructor() {
        this.collectionName = 'students'; // Usar minúsculas para nueva colección
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
            let query = {};
            
            // Manejar tanto ObjectId como string ID
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            } else {
                query = { id: id };
            }
            
            const student = await db.collection(this.collectionName).findOne(query);
            return student ? Student.fromObject(student) : null;
        } catch (error) {
            console.error('Error getting student by id:', error);
            throw new Error('Error al obtener el estudiante');
        }
    }

    // Crear nuevo estudiante
    async createStudent(studentData) {
        try {
            // Crear instancia del Student usando el método estático
            const student = Student.create(studentData);

            // Insertar en base de datos (MongoDB generará automáticamente el _id)
            const db = getDatabase();
            const result = await db.collection(this.collectionName).insertOne(student.toObject());
            
            // Retornar el student creado con el _id de MongoDB
            return Student.fromObject({ 
                ...student.toObject(), 
                _id: result.insertedId 
            });
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    }

    // Actualizar estudiante
    async updateStudent(id, updateData) {
        try {
            // Crear instancia del Student para validar
            const student = Student.create(updateData);

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
            
            // Preparar query para eliminar
            let query = {};
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            } else {
                query = { id: id };
            }
            
            const result = await db.collection(this.collectionName).deleteOne(query);
            
            if (result.deletedCount === 0) {
                throw new Error('Estudiante no encontrado');
            }

            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }

    // Buscar estudiantes por email
    async getStudentByEmail(email) {
        try {
            const db = getDatabase();
            const student = await db.collection(this.collectionName).findOne({ email: email });
            return student ? Student.fromObject(student) : null;
        } catch (error) {
            console.error('Error getting student by email:', error);
            throw new Error('Error al buscar estudiante por email');
        }
    }

    // Obtener estudiantes por nivel
    async getStudentsByLevel(level) {
        try {
            const db = getDatabase();
            const students = await db.collection(this.collectionName).find({ level: level }).toArray();
            return students.map(student => Student.fromObject(student));
        } catch (error) {
            console.error('Error getting students by level:', error);
            throw new Error('Error al obtener estudiantes por nivel');
        }
    }

    // Buscar estudiantes por nombre
    async searchStudentsByName(name) {
        try {
            const db = getDatabase();
            const students = await db.collection(this.collectionName).find({
                full_name: { $regex: name, $options: 'i' }
            }).toArray();
            
            return students.map(student => Student.fromObject(student));
        } catch (error) {
            console.error('Error searching students by name:', error);
            throw new Error('Error al buscar estudiantes por nombre');
        }
    }

    // Obtener estadísticas de estudiantes
    async getStudentStats() {
        try {
            const db = getDatabase();
            const totalStudents = await db.collection(this.collectionName).countDocuments();
            
            // Estudiantes por nivel
            const levelStats = await db.collection(this.collectionName).aggregate([
                { $group: { _id: '$level', count: { $sum: 1 } } }
            ]).toArray();

            // Estudiantes creados en el último mes
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            
            const recentStudents = await db.collection(this.collectionName).countDocuments({
                created: { $gte: lastMonth.toISOString() }
            });

            return {
                total: totalStudents,
                recent: recentStudents,
                byLevel: levelStats
            };
        } catch (error) {
            console.error('Error getting student stats:', error);
            throw new Error('Error al obtener estadísticas de estudiantes');
        }
    }
}

module.exports = new StudentService();