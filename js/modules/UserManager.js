// Gestor de Usuarios - Principio de Responsabilidad Única (SRP)
class UserManager {
    constructor(dataService) {
        this.dataService = dataService;
        this.currentUser = null;
    }

    // Cargar datos del usuario actual
    loadUserData() {
        const stored = localStorage.getItem('userData');
        if (!stored) {
            const adminUser = { 
                id: 'admin-1', 
                username: 'admin', 
                name: 'Administrator', 
                email: 'admin@leonorlanguageschool.com', 
                role: 'admin' 
            };
            localStorage.setItem('userData', JSON.stringify(adminUser));
            this.currentUser = adminUser;
        } else {
            this.currentUser = JSON.parse(stored);
        }
        return this.currentUser;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si es admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Verificar si es profesor
    isTeacher() {
        return this.currentUser && this.currentUser.role === 'teacher';
    }

    // Verificar si es estudiante
    isStudent() {
        return this.currentUser && this.currentUser.role === 'student';
    }

    // Actualizar información del usuario
    updateUserInfo(userInfo) {
        this.currentUser = { ...this.currentUser, ...userInfo };
        localStorage.setItem('userData', JSON.stringify(this.currentUser));
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem('userData');
        this.currentUser = null;
        window.location.href = '/';
    }

    // Cargar usuarios para gestión (solo admin)
    async loadUsers() {
        if (!this.isAdmin()) {
            throw new Error('No tienes permisos para gestionar usuarios');
        }

        try {
            const [teachers, students] = await Promise.all([
                this.dataService.getTeachers(),
                this.dataService.getStudents()
            ]);

            return { teachers, students };
        } catch (error) {
            console.error('Error loading users:', error);
            throw error;
        }
    }

    // Crear profesor
    async createTeacher(teacherData) {
        if (!this.isAdmin()) {
            throw new Error('No tienes permisos para crear profesores');
        }

        try {
            const result = await this.dataService.createTeacher(teacherData);
            Utils.showNotification('Profesor creado exitosamente', 'success');
            return result;
        } catch (error) {
            console.error('Error creating teacher:', error);
            Utils.showNotification('Error al crear profesor', 'error');
            throw error;
        }
    }

    // Crear estudiante
    async createStudent(studentData) {
        if (!this.isAdmin()) {
            throw new Error('No tienes permisos para crear estudiantes');
        }

        try {
            const result = await this.dataService.createStudent(studentData);
            Utils.showNotification('Estudiante creado exitosamente', 'success');
            return result;
        } catch (error) {
            console.error('Error creating student:', error);
            Utils.showNotification('Error al crear estudiante', 'error');
            throw error;
        }
    }

    // Eliminar profesor
    async deleteTeacher(id) {
        if (!this.isAdmin()) {
            throw new Error('No tienes permisos para eliminar profesores');
        }

        const confirmed = await Utils.confirm('¿Estás seguro de que quieres eliminar este profesor?');
        if (!confirmed) return false;

        try {
            await this.dataService.deleteTeacher(id);
            Utils.showNotification('Profesor eliminado exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting teacher:', error);
            Utils.showNotification('Error al eliminar profesor', 'error');
            throw error;
        }
    }

    // Eliminar estudiante
    async deleteStudent(id) {
        if (!this.isAdmin()) {
            throw new Error('No tienes permisos para eliminar estudiantes');
        }

        const confirmed = await Utils.confirm('¿Estás seguro de que quieres eliminar este estudiante?');
        if (!confirmed) return false;

        try {
            await this.dataService.deleteStudent(id);
            Utils.showNotification('Estudiante eliminado exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            Utils.showNotification('Error al eliminar estudiante', 'error');
            throw error;
        }
    }

    // Renderizar lista de profesores
    renderTeachersList(teachers, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (teachers.length === 0) {
            container.innerHTML = '<div class="no-data">No hay profesores en la base de datos</div>';
            return;
        }

        teachers.forEach(teacher => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${teacher.name || 'Sin nombre'}</div>
                    <div class="user-details">
                        ${teacher.email || 'Sin email'} 
                        ${teacher.age ? `• Edad: ${teacher.age}` : ''}
                        ${teacher.hobbies && teacher.hobbies.length > 0 ? `• Hobbies: ${teacher.hobbies.join(', ')}` : ''}
                    </div>
                </div>
                <div class="user-actions">
                    <button class="user-btn" onclick="userManager.editUser('teacher', '${Utils.getObjectId(teacher)}')">Editar</button>
                    <button class="user-btn danger" onclick="userManager.deleteTeacher('${Utils.getObjectId(teacher)}')">Eliminar</button>
                </div>
            `;
            container.appendChild(userItem);
        });
    }

    // Renderizar lista de estudiantes
    renderStudentsList(students, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (students.length === 0) {
            container.innerHTML = '<div class="no-data">No hay estudiantes en la base de datos</div>';
            return;
        }

        students.forEach(student => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${student.full_name || 'Sin nombre'}</div>
                    <div class="user-details">
                        Nivel: ${student.level || 'No especificado'}
                        ${student.email ? `• ${student.email}` : ''}
                        ${student.phone ? `• ${student.phone}` : ''}
                    </div>
                </div>
                <div class="user-actions">
                    <button class="user-btn" onclick="userManager.editUser('student', '${Utils.getObjectId(student)}')">Editar</button>
                    <button class="user-btn danger" onclick="userManager.deleteStudent('${Utils.getObjectId(student)}')">Eliminar</button>
                </div>
            `;
            container.appendChild(userItem);
        });
    }

    // Editar usuario (placeholder)
    editUser(type, id) {
        Utils.showNotification('Funcionalidad de edición próximamente', 'info');
    }
}

// Exportar para uso global
window.UserManager = UserManager;
