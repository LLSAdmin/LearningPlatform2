// Utilidades - Principio de Responsabilidad Única (SRP)
class Utils {
    // Formatear fecha
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Formatear hora
    static formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    }

    // Formatear fecha y hora
    static formatDateTime(dateString, timeString) {
        const date = new Date(`${dateString}T${timeString}`);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Calcular duración en horas
    static calculateHours(minutes) {
        return Math.round(minutes / 60 * 10) / 10;
    }

    // Obtener ID de un objeto (compatible con MongoDB)
    static getObjectId(obj) {
        return obj.id || obj._id;
    }

    // Buscar objeto por ID (compatible con MongoDB)
    static findById(array, id) {
        return array.find(item => (item.id === id) || (item._id === id));
    }

    // Filtrar array por ID (compatible con MongoDB)
    static filterById(array, id) {
        return array.filter(item => (item.id !== id) && (item._id !== id));
    }

    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar fecha
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Validar hora
    static isValidTime(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    // Generar ID único
    static generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Mostrar notificación
    static showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos básicos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        // Colores según tipo
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Confirmar acción
    static confirm(message) {
        return new Promise((resolve) => {
            const result = window.confirm(message);
            resolve(result);
        });
    }

    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copiado al portapapeles', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Error al copiar', 'error');
        }
    }

    // Obtener fecha actual en formato ISO
    static getCurrentDateTime() {
        const now = new Date();
        return now.toISOString().slice(0, 16);
    }

    // Obtener fecha actual en formato YYYY-MM-DD
    static getCurrentDate() {
        const now = new Date();
        return now.toISOString().slice(0, 10);
    }

    // Obtener hora actual en formato HH:MM
    static getCurrentTime() {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    }
}

// Exportar para uso global
window.Utils = Utils;
