// Servicio para Sessions - Principio de Responsabilidad Única (SRP)
const { getDatabase } = require('../../config/mongodb');

class SessionService {
    constructor() {
        this.collectionName = 'sessions';
    }

    // Guardar sesión
    async saveSession(sessionData) {
        try {
            const db = getDatabase();
            const result = await db.collection(this.collectionName).insertOne(sessionData);
            return { ...sessionData, _id: result.insertedId };
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    }

    // Obtener sesión por ID
    async getSession(sessionId) {
        try {
            const db = getDatabase();
            return await db.collection(this.collectionName).findOne({ id: sessionId });
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    // Actualizar sesión
    async updateSession(sessionId, updateData) {
        try {
            const db = getDatabase();
            const result = await db.collection(this.collectionName).updateOne(
                { id: sessionId },
                { $set: updateData }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('Error updating session:', error);
            return false;
        }
    }

    // Eliminar sesión
    async deleteSession(sessionId) {
        try {
            const db = getDatabase();
            const result = await db.collection(this.collectionName).deleteOne({ id: sessionId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }

    // Obtener todas las sesiones
    async getAllSessions() {
        try {
            const db = getDatabase();
            return await db.collection(this.collectionName).find({}).toArray();
        } catch (error) {
            console.error('Error getting all sessions:', error);
            return [];
        }
    }

    // Obtener sesiones por usuario
    async getSessionsByUser(userId) {
        try {
            const db = getDatabase();
            return await db.collection(this.collectionName).find({ userId }).toArray();
        } catch (error) {
            console.error('Error getting sessions by user:', error);
            return [];
        }
    }
}

module.exports = SessionService;
