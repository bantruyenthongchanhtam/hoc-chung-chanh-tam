const Toast = {
    init() {
        this.container = document.getElementById('toast-container');
    },

    show(type, title, message, duration = 4000) {
        if (!this.container) this.init();

        // Chọn icon dựa trên loại thông báo
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        // Tạo element toast
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.style.setProperty('--duration', `${duration}ms`);
        
        toast.innerHTML = `
            <div class="flex-shrink-0">
                <i data-lucide="${icons[type]}" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-stone-900 text-sm">${title}</h4>
                <p class="text-stone-500 text-xs mt-0.5">${message}</p>
            </div>
            <button class="text-stone-300 hover:text-stone-500 transition-colors" onclick="this.parentElement.remove()">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        // Thêm vào container và khởi tạo icon
        this.container.appendChild(toast);
        lucide.createIcons();

        // Hiệu ứng trượt vào
        setTimeout(() => toast.classList.add('show'), 10);

        // Tự động xóa sau thời gian chỉ định
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    },

    // FUNCTION
    success(title, msg) { this.show('success', title, msg); },
    error(title, msg) { this.show('error', title, msg); },
    warning(title, msg) { this.show('warning', title, msg); },
    info(title, msg) { this.show('info', title, msg); }
};