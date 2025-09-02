// Gestor del Dashboard - Principio de Responsabilidad Única (SRP)
class DashboardManager {
    constructor() {
        this.dataService = new DataService();
        this.userManager = new UserManager(this.dataService);
        this.classManager = new ClassManager(this.dataService, this.userManager);
    }

    // Inicializar dashboard
    async init() {
        try {
            // Cargar datos del usuario
            this.userManager.loadUserData();
            
            // Configurar UI basada en rol
            this.setupRoleBasedUI();
            
            // Cargar datos
            await this.loadDashboardData();
            
            // Actualizar estadísticas
            this.updateDashboardStats();
            
            console.log('✅ Dashboard inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
            Utils.showNotification('Error al cargar el dashboard', 'error');
        }
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            // Cargar datos en paralelo
            await Promise.all([
                this.classManager.loadClasses(),
                this.loadTeachersForSelectors(),
                this.loadUsersIfAdmin()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    // Cargar profesores para selectores
    async loadTeachersForSelectors() {
        try {
            const teachers = await this.dataService.getTeachers();
            this.populateTeacherSelectors(teachers);
        } catch (error) {
            console.error('Error loading teachers for selectors:', error);
        }
    }

    // Poblar selectores de profesores
    populateTeacherSelectors(teachers) {
        const selectors = ['assignedTeacher'];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (!select) return;

            select.innerHTML = '<option value="">Seleccionar profesor</option>';
            
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.name;
                option.textContent = teacher.name;
                select.appendChild(option);
            });
        });
    }

    // Cargar usuarios si es admin
    async loadUsersIfAdmin() {
        if (!this.userManager.isAdmin()) return;

        try {
            const { teachers, students } = await this.userManager.loadUsers();
            this.userManager.renderTeachersList(teachers, 'teachersList');
            this.userManager.renderStudentsList(students, 'studentsList');
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    // Configurar UI basada en rol
    setupRoleBasedUI() {
        const currentUser = this.userManager.getCurrentUser();
        
        // Actualizar información del usuario en el header
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.role;
        
        // Configurar mensaje de bienvenida
        const welcomeMessage = currentUser.role === 'admin' 
            ? '¡Bienvenido, Administrador!' 
            : currentUser.role === 'teacher' 
                ? '¡Listo para enseñar?' 
                : '¡Listo para aprender?';
        document.getElementById('welcomeMessage').textContent = welcomeMessage;

        // Configurar acciones rápidas
        this.setupQuickActions(currentUser.role);
        
        // Configurar sección de clases
        this.setupClassesSection(currentUser.role);
    }

    // Configurar acciones rápidas
    setupQuickActions(role) {
        const actionsGrid = document.getElementById('actionsGrid');
        if (!actionsGrid) return;

        let actions = [];

        if (role === 'admin') {
            actions = [
                { icon: 'fas fa-plus', text: 'Crear Clase', onclick: 'dashboardManager.showCreateClassModal()' },
                { icon: 'fas fa-user-plus', text: 'Agregar Profesor', onclick: 'dashboardManager.showCreateTeacherModal()' },
                { icon: 'fas fa-user-graduate', text: 'Agregar Estudiante', onclick: 'dashboardManager.showCreateStudentModal()' },
                { icon: 'fas fa-users', text: 'Gestionar Usuarios', onclick: 'dashboardManager.showUserManagement()' }
            ];
        } else if (role === 'teacher') {
            actions = [
                { icon: 'fas fa-plus', text: 'Crear Clase', onclick: 'dashboardManager.showCreateClassModal()' },
                { icon: 'fas fa-calendar', text: 'Ver Calendario', onclick: 'dashboardManager.showCalendar()' },
                { icon: 'fas fa-chart-bar', text: 'Estadísticas', onclick: 'dashboardManager.showStats()' }
            ];
        } else if (role === 'student') {
            actions = [
                { icon: 'fas fa-calendar', text: 'Mis Clases', onclick: 'dashboardManager.showMyClasses()' },
                { icon: 'fas fa-book', text: 'Materiales', onclick: 'dashboardManager.showMaterials()' },
                { icon: 'fas fa-chart-line', text: 'Progreso', onclick: 'dashboardManager.showProgress()' }
            ];
        }

        actionsGrid.innerHTML = actions.map(action => `
            <button class="action-card" onclick="${action.onclick}">
                <div class="action-icon">
                    <i class="${action.icon}"></i>
                </div>
                <div class="action-text">${action.text}</div>
            </button>
        `).join('');
    }

    // Configurar sección de clases
    setupClassesSection(role) {
        const classesSectionTitle = document.getElementById('classesSectionTitle');
        const classesSectionActions = document.getElementById('classesSectionActions');

        if (role === 'admin') {
            classesSectionTitle.textContent = 'Todas las Clases';
            classesSectionActions.innerHTML = `
                <button class="btn btn-primary" onclick="dashboardManager.showCreateClassModal()">
                    <i class="fas fa-plus"></i> Nueva Clase
                </button>
            `;
        } else if (role === 'teacher') {
            classesSectionTitle.textContent = 'Mis Clases';
            classesSectionActions.innerHTML = `
                <button class="btn btn-primary" onclick="dashboardManager.showCreateClassModal()">
                    <i class="fas fa-plus"></i> Nueva Clase
                </button>
            `;
        } else {
            classesSectionTitle.textContent = 'Mis Clases';
            classesSectionActions.innerHTML = '';
        }
    }

    // Actualizar estadísticas del dashboard
    updateDashboardStats() {
        const stats = this.classManager.getStats();
        const userStats = this.dataService.getStats();

        document.getElementById('totalClasses').textContent = stats.totalClasses;
        document.getElementById('teachingHours').textContent = stats.totalHours;
        document.getElementById('totalTeachers').textContent = userStats.teachers;
    }

    // Mostrar modal de crear clase
    showCreateClassModal() {
        const modal = document.getElementById('createClassModal');
        if (modal) {
            modal.style.display = 'block';
            this.setupCreateClassForm();
        }
    }

    // Configurar formulario de crear clase
    setupCreateClassForm() {
        const form = document.getElementById('createClassForm');
        if (!form) return;

        // Establecer fecha y hora actual
        document.getElementById('classDateTime').value = Utils.getCurrentDateTime();
        
        // Mostrar selección de profesor solo para admin
        const teacherSelectionGroup = document.getElementById('teacherSelectionGroup');
        if (teacherSelectionGroup) {
            teacherSelectionGroup.style.display = this.userManager.isAdmin() ? 'block' : 'none';
        }
    }

    // Mostrar modal de crear profesor
    showCreateTeacherModal() {
        const modal = document.getElementById('createTeacherModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Mostrar modal de crear estudiante
    showCreateStudentModal() {
        const modal = document.getElementById('createStudentModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Mostrar gestión de usuarios
    showUserManagement() {
        const modal = document.getElementById('userManagementModal');
        if (modal) {
            modal.style.display = 'block';
            this.loadUsersIfAdmin();
        }
    }

    // Cerrar modales
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    // Manejar envío de formulario de clase
    async handleCreateClass(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const classData = {
            name: formData.get('className'),
            student_name: formData.get('studentName'),
            teacher_name: formData.get('assignedTeacher') || this.userManager.getCurrentUser().name,
            scheduled_date: formData.get('classDateTime').split('T')[0],
            scheduled_time: formData.get('classDateTime').split('T')[1],
            duration: parseInt(formData.get('classDuration')),
            status: 'scheduled'
        };

        try {
            await this.classManager.createClass(classData);
            this.closeModal('createClassModal');
            this.updateDashboardStats();
        } catch (error) {
            console.error('Error creating class:', error);
        }
    }

    // Manejar envío de formulario de profesor
    async handleCreateTeacher(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const teacherData = {
            name: formData.get('teacherName'),
            email: formData.get('teacherEmail'),
            username: formData.get('teacherUsername'),
            password: formData.get('teacherPassword'),
            role: 'teacher'
        };

        try {
            await this.userManager.createTeacher(teacherData);
            this.closeModal('createTeacherModal');
            this.loadUsersIfAdmin();
            this.updateDashboardStats();
        } catch (error) {
            console.error('Error creating teacher:', error);
        }
    }

    // Manejar envío de formulario de estudiante
    async handleCreateStudent(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const studentData = {
            full_name: formData.get('studentName'),
            level: formData.get('studentLevel')
        };

        try {
            await this.userManager.createStudent(studentData);
            this.closeModal('createStudentModal');
            this.loadUsersIfAdmin();
        } catch (error) {
            console.error('Error creating student:', error);
        }
    }

    // Placeholder methods para funcionalidades futuras
    showCalendar() { Utils.showNotification('Calendario próximamente', 'info'); }
    showStats() { Utils.showNotification('Estadísticas próximamente', 'info'); }
    showMyClasses() { Utils.showNotification('Mis clases próximamente', 'info'); }
    showMaterials() { Utils.showNotification('Materiales próximamente', 'info'); }
    showProgress() { Utils.showNotification('Progreso próximamente', 'info'); }
}

// Exportar para uso global
window.DashboardManager = DashboardManager;
