// Servicio de API - Principio de Responsabilidad Única (SRP)
class ApiService {
    constructor() {
        this.baseUrl = '/api';
    }

    // Método genérico para hacer requests
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // Teachers API
    async getTeachers() {
        return this.request('/teachers');
    }

    async getTeacherById(id) {
        return this.request(`/teachers/${id}`);
    }

    async createTeacher(teacherData) {
        return this.request('/teachers', {
            method: 'POST',
            body: JSON.stringify(teacherData)
        });
    }

    async updateTeacher(id, teacherData) {
        return this.request(`/teachers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(teacherData)
        });
    }

    async deleteTeacher(id) {
        return this.request(`/teachers/${id}`, {
            method: 'DELETE'
        });
    }

    // Students API
    async getStudents() {
        return this.request('/students');
    }

    async getStudentById(id) {
        return this.request(`/students/${id}`);
    }

    async createStudent(studentData) {
        return this.request('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    }

    async updateStudent(id, studentData) {
        return this.request(`/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    }

    async deleteStudent(id) {
        return this.request(`/students/${id}`, {
            method: 'DELETE'
        });
    }

    // Classes API
    async getClasses() {
        return this.request('/classes');
    }

    async getClassById(id) {
        return this.request(`/classes/${id}`);
    }

    async createClass(classData) {
        return this.request('/classes', {
            method: 'POST',
            body: JSON.stringify(classData)
        });
    }

    async updateClass(id, classData) {
        return this.request(`/classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(classData)
        });
    }

    async deleteClass(id) {
        return this.request(`/classes/${id}`, {
            method: 'DELETE'
        });
    }

    // Sessions API
    async getSessions() {
        return this.request('/sessions');
    }

    async getSessionById(id) {
        return this.request(`/sessions/${id}`);
    }

    async createSession(sessionData) {
        return this.request('/sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }

    async updateSession(id, sessionData) {
        return this.request(`/sessions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(sessionData)
        });
    }

    async deleteSession(id) {
        return this.request(`/sessions/${id}`, {
            method: 'DELETE'
        });
    }
}

// Exportar para uso global
window.ApiService = ApiService;
