// Modelo para Teachers - Principio de Responsabilidad Única (SRP)
class Teacher {
    constructor(data) {
        // ID solo si MongoDB no lo genera automáticamente
        this.id = data.id || (data._id ? data._id.toString() : null);
        this.name = data.name || '';
        this.lastname = data.lastname || '';
        this.email = data.email || '';
        this.created = data.created || new Date().toISOString();
    }

    // Validación de datos del profesor
    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!this.lastname || this.lastname.trim().length < 2) {
            errors.push('El apellido debe tener al menos 2 caracteres');
        }

        if (!this.email || !this.isValidEmail(this.email)) {
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

    // Obtener nombre completo
    getFullName() {
        return `${this.name} ${this.lastname}`.trim();
    }

    // Convertir a objeto plano para MongoDB
    toObject() {
        return {
            name: this.name,
            lastname: this.lastname,
            email: this.email,
            created: this.created
        };
    }

    // Crear desde objeto de MongoDB
    static fromObject(data) {
        return new Teacher(data);
    }

    // Crear un nuevo Teacher con datos mínimos
    static create(data) {
        const teacher = new Teacher({
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            created: new Date().toISOString()
        });

        const validation = teacher.validate();
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        return teacher;
    }
}

module.exports = Teacher;