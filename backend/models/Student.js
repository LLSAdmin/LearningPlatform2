// Modelo para Students - Principio de Responsabilidad Única (SRP)
class Student {
    constructor(data) {
        this.id = data.id || null;
        this.full_name = data.full_name || '';
        this.level = data.level || 'beginner';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.created_at = data.created_at || new Date().toISOString();
    }

    // Validación de datos del estudiante
    validate() {
        const errors = [];
        
        if (!this.full_name || this.full_name.trim().length < 2) {
            errors.push('El nombre completo debe tener al menos 2 caracteres');
        }
        
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (!validLevels.includes(this.level)) {
            errors.push('El nivel debe ser: beginner, intermediate o advanced');
        }
        
        if (this.email && !this.isValidEmail(this.email)) {
            errors.push('El email debe ser válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validación de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Convertir a objeto plano para MongoDB
    toObject() {
        return {
            id: this.id,
            full_name: this.full_name,
            level: this.level,
            email: this.email,
            phone: this.phone,
            created_at: this.created_at
        };
    }

    // Crear desde objeto de MongoDB
    static fromObject(data) {
        return new Student(data);
    }
}

module.exports = Student;
