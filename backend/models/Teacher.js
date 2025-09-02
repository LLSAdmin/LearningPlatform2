// Modelo para Teachers - Principio de Responsabilidad Única (SRP)
class Teacher {
    constructor(data) {
        this.id = data.id || null;
        this.username = data.username || '';
        this.name = data.name || '';
        this.email = data.email || '';
        this.age = data.age || null;
        this.hobbies = data.hobbies || [];
        this.created_at = data.created_at || new Date().toISOString();
    }

    // Validación de datos del profesor
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }
        
        if (!this.email || !this.isValidEmail(this.email)) {
            errors.push('El email debe ser válido');
        }
        
        // Username es opcional para compatibilidad con datos existentes
        if (this.username && this.username.trim().length < 3) {
            errors.push('El username debe tener al menos 3 caracteres');
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
            username: this.username,
            name: this.name,
            email: this.email,
            age: this.age,
            hobbies: this.hobbies,
            created_at: this.created_at
        };
    }

    // Crear desde objeto de MongoDB
    static fromObject(data) {
        return new Teacher(data);
    }
}

module.exports = Teacher;
