// Archivo principal del Dashboard - Inicialización y configuración global
let dashboardManager;
let dataService;
let userManager;
let classManager;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Inicializando Dashboard...');
        
        // Crear instancias globales
        dataService = new DataService();
        userManager = new UserManager(dataService);
        classManager = new ClassManager(dataService, userManager);
        dashboardManager = new DashboardManager();
        
        // Hacer disponibles globalmente para compatibilidad
        window.dataService = dataService;
        window.userManager = userManager;
        window.classManager = classManager;
        window.dashboardManager = dashboardManager;
        
        // Inicializar dashboard
        await dashboardManager.init();
        
        console.log('✅ Dashboard inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
        Utils.showNotification('Error al cargar el dashboard', 'error');
    }
});

// Funciones globales para compatibilidad con HTML
function switchTab(tab) {
    if (classManager) {
        classManager.switchTab(tab);
    }
}

function filterClasses() {
    if (classManager) {
        classManager.filterClasses();
    }
}

function deleteClass(classId) {
    if (classManager) {
        classManager.deleteClass(classId);
    }
}

function editClass(classId) {
    if (classManager) {
        classManager.editClass(classId);
    }
}

function viewClassDetails(classId) {
    if (classManager) {
        classManager.viewClassDetails(classId);
    }
}

function addToCalendar(classId) {
    if (classManager) {
        classManager.addToCalendar(classId);
    }
}

function copyStudentLink(classId) {
    if (classManager) {
        classManager.copyStudentLink(classId);
    }
}

function enterClass(classId) {
    if (classManager) {
        classManager.enterClass(classId);
    }
}

function deleteUser(type, id) {
    if (userManager) {
        if (type === 'teacher') {
            userManager.deleteTeacher(id);
        } else if (type === 'student') {
            userManager.deleteStudent(id);
        }
    }
}

function editUser(type, id) {
    if (userManager) {
        userManager.editUser(type, id);
    }
}

function logout() {
    if (userManager) {
        userManager.logout();
    }
}

// Funciones de modales
function closeCreateClassModal() {
    if (dashboardManager) {
        dashboardManager.closeModal('createClassModal');
    }
}

function closeCreateTeacherModal() {
    if (dashboardManager) {
        dashboardManager.closeModal('createTeacherModal');
    }
}

function closeCreateStudentModal() {
    if (dashboardManager) {
        dashboardManager.closeModal('createStudentModal');
    }
}

function closeUserManagementModal() {
    if (dashboardManager) {
        dashboardManager.closeModal('userManagementModal');
    }
}

// Manejo de formularios
document.addEventListener('submit', function(event) {
    const form = event.target;
    
    if (form.id === 'createClassForm') {
        event.preventDefault();
        if (dashboardManager) {
            dashboardManager.handleCreateClass(event);
        }
    } else if (form.id === 'createTeacherForm') {
        event.preventDefault();
        if (dashboardManager) {
            dashboardManager.handleCreateTeacher(event);
        }
    } else if (form.id === 'createStudentForm') {
        event.preventDefault();
        if (dashboardManager) {
            dashboardManager.handleCreateStudent(event);
        }
    }
});

// Cerrar modales al hacer clic fuera
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    Utils.showNotification('Ha ocurrido un error inesperado', 'error');
});

// Manejo de promesas rechazadas
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesa rechazada:', event.reason);
    Utils.showNotification('Error en operación asíncrona', 'error');
});
