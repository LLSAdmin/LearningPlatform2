// Modelo para Classes - Principio de Responsabilidad Única (SRP)
class Class {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.student_name = data.student_name || '';
        this.teacher_name = data.teacher_name || '';
        this.scheduled_date = data.scheduled_date || new Date().toISOString().slice(0, 10);
        this.scheduled_time = data.scheduled_time || '09:00';
        this.duration = data.duration || 60;
        this.status = data.status || 'scheduled';
        this.created_at = data.created_at || new Date().toISOString();
    }

    // Validación de datos de la clase
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length < 2) {
            errors.push('El nombre de la clase debe tener al menos 2 caracteres');
        }
        
        if (!this.student_name || this.student_name.trim().length < 2) {
            errors.push('El nombre del estudiante debe tener al menos 2 caracteres');
        }
        
        if (!this.teacher_name || this.teacher_name.trim().length < 2) {
            errors.push('El nombre del profesor debe tener al menos 2 caracteres');
        }
        
        if (!this.isValidDate(this.scheduled_date)) {
            errors.push('La fecha programada debe ser válida');
        }
        
        if (!this.isValidTime(this.scheduled_time)) {
            errors.push('La hora programada debe ser válida (formato HH:MM)');
        }
        
        if (this.duration < 15 || this.duration > 180) {
            errors.push('La duración debe estar entre 15 y 180 minutos');
        }
        
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(this.status)) {
            errors.push('El estado debe ser: scheduled, in_progress, completed o cancelled');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validación de fecha
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Validación de hora
    isValidTime(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    // Convertir a objeto plano para MongoDB
    toObject() {
        return {
            id: this.id,
            name: this.name,
            student_name: this.student_name,
            teacher_name: this.teacher_name,
            scheduled_date: this.scheduled_date,
            scheduled_time: this.scheduled_time,
            duration: this.duration,
            status: this.status,
            created_at: this.created_at
        };
    }

    // Crear desde objeto de MongoDB
    static fromObject(data) {
        return new Class(data);
    }
}

module.exports = Class;
