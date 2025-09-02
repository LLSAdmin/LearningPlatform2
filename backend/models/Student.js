// Modelo para Students - Principio de Responsabilidad Única (SRP)
class Student {
    constructor(data) {
        // ID solo si MongoDB no lo genera automáticamente
        this.id = data.id || (data._id ? data._id.toString() : null);
        this.full_name = data.full_name || '';
        this.level = data.level || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.created = data.created || new Date().toISOString();
    }

    // Validación de datos del estudiante
    validate() {
        const errors = [];
        
        if (!this.full_name || this.full_name.trim().length < 2) {
            errors.push('El nombre completo debe tener al menos 2 caracteres');
        }
        
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (!this.level || !validLevels.includes(this.level)) {
            errors.push('El nivel debe ser: beginner, intermediate o advanced');
        }
        
        if (this.email && !this.isValidEmail(this.email)) {
            errors.push('El email debe ser válido');
        }
        
        if (this.phone && !this.isValidPhone(this.phone)) {
            errors.push('El teléfono debe ser válido');
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

    // Validación de teléfono
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Obtener nombre completo
    getFullName() {
        return this.full_name.trim();
    }

    // Convertir a objeto plano para MongoDB
    toObject() {
        return {
            full_name: this.full_name,
            level: this.level,
            email: this.email,
            phone: this.phone,
            created: this.created
        };
    }

    // Crear desde objeto de MongoDB
    static fromObject(data) {
        return new Student(data);
    }

    // Crear un nuevo Student con datos mínimos
    static create(data) {
        const student = new Student({
            full_name: data.full_name,
            level: data.level,
            email: data.email,
            phone: data.phone,
            created: new Date().toISOString()
        });

        const validation = student.validate();
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        return student;
    }
}

module.exports = Student;