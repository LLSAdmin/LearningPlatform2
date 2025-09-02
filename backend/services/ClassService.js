// Servicio para Classes - Principio de Responsabilidad Única (SRP)
const Class = require('../models/Class');
const { getDatabase } = require('../../config/mongodb');

class ClassService {
    constructor() {
        this.collectionName = 'classes';
    }

    // Obtener todas las clases
    async getAllClasses() {
        try {
            const db = getDatabase();
            const classes = await db.collection(this.collectionName).find({}).toArray();
            return classes.map(classItem => Class.fromObject(classItem));
        } catch (error) {
            console.error('Error getting all classes:', error);
            throw new Error('Error al obtener las clases');
        }
    }

    // Obtener clase por ID
    async getClassById(id) {
        try {
            const db = getDatabase();
            const classItem = await db.collection(this.collectionName).findOne({ id: parseInt(id) });
            return classItem ? Class.fromObject(classItem) : null;
        } catch (error) {
            console.error('Error getting class by id:', error);
            throw new Error('Error al obtener la clase');
        }
    }

    // Crear nueva clase
    async createClass(classData) {
        try {
            // Validar datos
            const classItem = new Class(classData);
            const validation = classItem.validate();
            
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            // Obtener siguiente ID
            const nextId = await this.getNextId();
            classItem.id = nextId;

            // Insertar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).insertOne(classItem.toObject());
            
            return Class.fromObject({ ...classItem.toObject(), _id: result.insertedId });
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    }

    // Actualizar clase
    async updateClass(id, updateData) {
        try {
            // Validar datos
            const classItem = new Class(updateData);
            const validation = classItem.validate();
            
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }

            // Actualizar en base de datos
            const db = getDatabase();
            const result = await db.collection(this.collectionName).updateOne(
                { id: parseInt(id) },
                { $set: classItem.toObject() }
            );

            if (result.modifiedCount === 0) {
                throw new Error('Clase no encontrada');
            }

            return await this.getClassById(id);
        } catch (error) {
            console.error('Error updating class:', error);
            throw error;
        }
    }

    // Eliminar clase
    async deleteClass(id) {
        try {
            const db = getDatabase();
            const result = await db.collection(this.collectionName).deleteOne({ id: parseInt(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Clase no encontrada');
            }

            return true;
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    }

    // Obtener clases por estado
    async getClassesByStatus(status) {
        try {
            const db = getDatabase();
            const classes = await db.collection(this.collectionName).find({ status }).toArray();
            return classes.map(classItem => Class.fromObject(classItem));
        } catch (error) {
            console.error('Error getting classes by status:', error);
            throw new Error('Error al obtener clases por estado');
        }
    }

    // Obtener clases por fecha
    async getClassesByDate(date) {
        try {
            const db = getDatabase();
            const classes = await db.collection(this.collectionName).find({ scheduled_date: date }).toArray();
            return classes.map(classItem => Class.fromObject(classItem));
        } catch (error) {
            console.error('Error getting classes by date:', error);
            throw new Error('Error al obtener clases por fecha');
        }
    }

    // Obtener siguiente ID disponible
    async getNextId() {
        try {
            const db = getDatabase();
            const classes = await db.collection(this.collectionName).find({}).toArray();
            return classes.length > 0 ? Math.max(...classes.map(c => c.id || 0)) + 1 : 1;
        } catch (error) {
            console.error('Error getting next ID:', error);
            return 1;
        }
    }
}

module.exports = ClassService;
