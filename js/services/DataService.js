// Servicio de Datos - Principio de Responsabilidad Única (SRP)
class DataService {
    constructor() {
        this.apiService = new ApiService();
        this.cache = {
            teachers: [],
            students: [],
            classes: [],
            sessions: []
        };
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
        this.lastFetch = {};
    }

    // Verificar si el cache está expirado
    isCacheExpired(key) {
        const lastFetch = this.lastFetch[key];
        if (!lastFetch) return true;
        return Date.now() - lastFetch > this.cacheExpiry;
    }

    // Obtener profesores
    async getTeachers(forceRefresh = false) {
        if (!forceRefresh && !this.isCacheExpired('teachers') && this.cache.teachers.length > 0) {
            return this.cache.teachers;
        }

        try {
            this.cache.teachers = await this.apiService.getTeachers();
            this.lastFetch.teachers = Date.now();
            console.log('📊 Teachers loaded from API:', this.cache.teachers);
            return this.cache.teachers;
        } catch (error) {
            console.error('Error loading teachers:', error);
            return [];
        }
    }

    // Obtener estudiantes
    async getStudents(forceRefresh = false) {
        if (!forceRefresh && !this.isCacheExpired('students') && this.cache.students.length > 0) {
            return this.cache.students;
        }

        try {
            this.cache.students = await this.apiService.getStudents();
            this.lastFetch.students = Date.now();
            console.log('📊 Students loaded from API:', this.cache.students);
            return this.cache.students;
        } catch (error) {
            console.error('Error loading students:', error);
            return [];
        }
    }

    // Obtener clases
    async getClasses(forceRefresh = false) {
        if (!forceRefresh && !this.isCacheExpired('classes') && this.cache.classes.length > 0) {
            return this.cache.classes;
        }

        try {
            this.cache.classes = await this.apiService.getClasses();
            this.lastFetch.classes = Date.now();
            console.log('📊 Classes loaded from API:', this.cache.classes);
            return this.cache.classes;
        } catch (error) {
            console.error('Error loading classes:', error);
            return [];
        }
    }

    // Obtener sesiones
    async getSessions(forceRefresh = false) {
        if (!forceRefresh && !this.isCacheExpired('sessions') && this.cache.sessions.length > 0) {
            return this.cache.sessions;
        }

        try {
            this.cache.sessions = await this.apiService.getSessions();
            this.lastFetch.sessions = Date.now();
            console.log('📊 Sessions loaded from API:', this.cache.sessions);
            return this.cache.sessions;
        } catch (error) {
            console.error('Error loading sessions:', error);
            return [];
        }
    }

    // Crear profesor
    async createTeacher(teacherData) {
        try {
            const newTeacher = await this.apiService.createTeacher(teacherData);
            this.cache.teachers.push(newTeacher.teacher);
            this.lastFetch.teachers = Date.now();
            return newTeacher;
        } catch (error) {
            console.error('Error creating teacher:', error);
            throw error;
        }
    }

    // Crear estudiante
    async createStudent(studentData) {
        try {
            const newStudent = await this.apiService.createStudent(studentData);
            this.cache.students.push(newStudent.student);
            this.lastFetch.students = Date.now();
            return newStudent;
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    }

    // Crear clase
    async createClass(classData) {
        try {
            const newClass = await this.apiService.createClass(classData);
            this.cache.classes.push(newClass.class);
            this.lastFetch.classes = Date.now();
            return newClass;
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    }

    // Eliminar profesor
    async deleteTeacher(id) {
        try {
            await this.apiService.deleteTeacher(id);
            this.cache.teachers = this.cache.teachers.filter(t => (t.id !== id && t._id !== id));
            this.lastFetch.teachers = Date.now();
            return true;
        } catch (error) {
            console.error('Error deleting teacher:', error);
            throw error;
        }
    }

    // Eliminar estudiante
    async deleteStudent(id) {
        try {
            await this.apiService.deleteStudent(id);
            this.cache.students = this.cache.students.filter(s => (s.id !== id && s._id !== id));
            this.lastFetch.students = Date.now();
            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    }

    // Eliminar clase
    async deleteClass(id) {
        try {
            await this.apiService.deleteClass(id);
            this.cache.classes = this.cache.classes.filter(c => (c.id !== id && c._id !== id));
            this.lastFetch.classes = Date.now();
            return true;
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    }

    // Limpiar cache
    clearCache() {
        this.cache = {
            teachers: [],
            students: [],
            classes: [],
            sessions: []
        };
        this.lastFetch = {};
    }

    // Obtener estadísticas
    getStats() {
        return {
            teachers: this.cache.teachers.length,
            students: this.cache.students.length,
            classes: this.cache.classes.length,
            sessions: this.cache.sessions.length
        };
    }
}

// Exportar para uso global
window.DataService = DataService;
