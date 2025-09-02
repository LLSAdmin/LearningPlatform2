// Gestor de Clases - Principio de Responsabilidad Única (SRP)
class ClassManager {
    constructor(dataService, userManager) {
        this.dataService = dataService;
        this.userManager = userManager;
        this.classes = [];
        this.currentTab = 'upcoming';
    }

    // Cargar clases
    async loadClasses() {
        try {
            this.classes = await this.dataService.getClasses();
            this.renderClasses();
            return this.classes;
        } catch (error) {
            console.error('Error loading classes:', error);
            this.classes = [];
            return [];
        }
    }

    // Crear clase
    async createClass(classData) {
        try {
            const result = await this.dataService.createClass(classData);
            await this.loadClasses(); // Recargar clases
            Utils.showNotification('Clase creada exitosamente', 'success');
            return result;
        } catch (error) {
            console.error('Error creating class:', error);
            Utils.showNotification('Error al crear clase', 'error');
            throw error;
        }
    }

    // Eliminar clase
    async deleteClass(id) {
        const confirmed = await Utils.confirm('¿Estás seguro de que quieres eliminar esta clase?');
        if (!confirmed) return false;

        try {
            await this.dataService.deleteClass(id);
            await this.loadClasses(); // Recargar clases
            Utils.showNotification('Clase eliminada exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting class:', error);
            Utils.showNotification('Error al eliminar clase', 'error');
            throw error;
        }
    }

    // Cambiar pestaña
    switchTab(tab) {
        this.currentTab = tab;
        
        // Actualizar botones de pestaña
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Mostrar contenido correspondiente
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(`${tab}Tab`).style.display = 'block';
        
        this.renderClasses();
    }

    // Filtrar clases por pestaña
    getFilteredClasses() {
        const currentUser = this.userManager.getCurrentUser();
        let filteredClasses = this.classes;

        // Filtrar por rol de usuario
        if (currentUser.role === 'teacher') {
            filteredClasses = this.classes.filter(cls => cls.teacher_name === currentUser.name);
        } else if (currentUser.role === 'student') {
            filteredClasses = this.classes.filter(cls => cls.student_name === currentUser.name);
        }

        // Filtrar por pestaña
        const now = new Date();
        if (this.currentTab === 'upcoming') {
            return filteredClasses.filter(cls => {
                const classDate = new Date(`${cls.scheduled_date}T${cls.scheduled_time}`);
                return classDate > now;
            });
        } else {
            return filteredClasses.filter(cls => {
                const classDate = new Date(`${cls.scheduled_date}T${cls.scheduled_time}`);
                return classDate <= now;
            });
        }
    }

    // Renderizar clases
    renderClasses() {
        const tbody = document.getElementById('classesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const filteredClasses = this.getFilteredClasses();

        if (filteredClasses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        ${this.currentTab === 'upcoming' ? 'No hay clases próximas' : 'No hay clases pasadas'}
                    </td>
                </tr>
            `;
            return;
        }

        filteredClasses.forEach(cls => {
            const row = document.createElement('tr');
            const date = new Date(`${cls.scheduled_date}T${cls.scheduled_time}`);
            const endTime = new Date(date.getTime() + (cls.duration * 60000));
            const currentUser = this.userManager.getCurrentUser();

            row.innerHTML = `
                <td>${cls.name}</td>
                <td>${cls.student_name}</td>
                <td>${cls.teacher_name}</td>
                <td>${Utils.formatDateTime(cls.scheduled_date, cls.scheduled_time)}</td>
                <td>${cls.duration} min</td>
                <td>
                    <div class="action-buttons">
                        ${this.currentTab === 'upcoming' ? `
                            <button class="action-btn" onclick="classManager.editClass('${Utils.getObjectId(cls)}')" title="Editar">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="action-btn" onclick="classManager.addToCalendar('${Utils.getObjectId(cls)}')" title="Agregar al Calendario">
                                <i class="fas fa-calendar-plus"></i> Calendario
                            </button>
                            <button class="action-btn" onclick="classManager.copyStudentLink('${Utils.getObjectId(cls)}')" title="Copiar Enlace del Estudiante">
                                <i class="fas fa-users"></i> Enlace
                            </button>
                            <button class="action-btn primary" onclick="classManager.enterClass('${Utils.getObjectId(cls)}')" title="Entrar a la Clase">
                                <i class="fas fa-arrow-right"></i> Entrar
                            </button>
                        ` : `
                            <button class="action-btn" onclick="classManager.viewClassDetails('${Utils.getObjectId(cls)}')" title="Ver Detalles">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            ${currentUser.role === 'admin' ? `
                                <button class="action-btn" onclick="classManager.editClass('${Utils.getObjectId(cls)}')" title="Editar">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            ` : ''}
                        `}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Filtrar clases por búsqueda
    filterClasses() {
        const searchTerm = document.getElementById('classSearch')?.value.toLowerCase() || '';
        const rows = document.querySelectorAll('#classesTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    // Ver detalles de clase
    viewClassDetails(classId) {
        const cls = Utils.findById(this.classes, classId);
        if (!cls) return;
        
        const date = new Date(`${cls.scheduled_date}T${cls.scheduled_time}`);
        const endTime = new Date(date.getTime() + (cls.duration * 60000));
        
        const details = `
            <strong>${cls.name}</strong><br>
            <strong>Estudiante:</strong> ${cls.student_name}<br>
            <strong>Profesor:</strong> ${cls.teacher_name}<br>
            <strong>Fecha:</strong> ${Utils.formatDate(cls.scheduled_date)}<br>
            <strong>Hora:</strong> ${Utils.formatTime(cls.scheduled_time)} - ${Utils.formatTime(endTime.toTimeString().slice(0, 5))}<br>
            <strong>Duración:</strong> ${cls.duration} minutos<br>
            <strong>Estado:</strong> ${cls.status}
        `;
        
        alert(details);
    }

    // Editar clase (placeholder)
    editClass(classId) {
        Utils.showNotification('Funcionalidad de edición próximamente', 'info');
    }

    // Agregar al calendario (placeholder)
    addToCalendar(classId) {
        Utils.showNotification('Funcionalidad de calendario próximamente', 'info');
    }

    // Copiar enlace del estudiante (placeholder)
    copyStudentLink(classId) {
        const cls = Utils.findById(this.classes, classId);
        if (cls) {
            const link = `${window.location.origin}/classroom?class=${Utils.getObjectId(cls)}`;
            Utils.copyToClipboard(link);
        }
    }

    // Entrar a clase
    enterClass(classId) {
        const cls = Utils.findById(this.classes, classId);
        if (cls) {
            window.location.href = `/classroom?class=${Utils.getObjectId(cls)}`;
        }
    }

    // Obtener estadísticas de clases
    getStats() {
        const currentUser = this.userManager.getCurrentUser();
        let filteredClasses = this.classes;

        if (currentUser.role === 'teacher') {
            filteredClasses = this.classes.filter(cls => cls.teacher_name === currentUser.name);
        } else if (currentUser.role === 'student') {
            filteredClasses = this.classes.filter(cls => cls.student_name === currentUser.name);
        }

        const totalMinutes = filteredClasses.reduce((sum, cls) => sum + cls.duration, 0);
        const totalHours = Utils.calculateHours(totalMinutes);

        return {
            totalClasses: filteredClasses.length,
            totalHours: totalHours
        };
    }
}

// Exportar para uso global
window.ClassManager = ClassManager;
