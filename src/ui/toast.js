const Toast = (() => {
    /* =======================
       STATE / TRẠNG THÁI
       Toast notification system container and active toast tracking
       Hệ thống vùng chứa thông báo toast và theo dõi toast hoạt động
    ======================= */
    let container = null;
    const activeToasts = new Map(); // Track active timers for cleanup / Theo dõi bộ định thời hoạt động để dọn dẹp

    /* =======================
       UTILITY / TIỆN ÍCH
       Helper function to safely set text content
       Hàm trợ giúp để đặt nội dung văn bản một cách an toàn
    ======================= */
    const createTextElement = (tagName, text, className = '') => {
        const el = document.createElement(tagName);
        el.textContent = text; // Safe - prevents XSS / An toàn - ngăn XSS
        if (className) el.className = className;
        return el;
    };

    const createIconElement = (iconName) => {
        const i = document.createElement('i');
        i.setAttribute('data-lucide', iconName);
        i.className = 'w-6 h-6';
        return i;
    };

    const init = () => {
        if (!container) {
            container = document.getElementById('toast-container');
        }
        return container;
    };

    const show = (type, title, message, duration = 4000) => {
        const cont = init();
        if (!cont) {
            console.warn('Toast container not found');
            return;
        }

        // Icon map for each type / Bản đồ icon cho mỗi loại
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        // Create toast element / Tạo phần tử toast
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.style.setProperty('--duration', `${duration}ms`);
        
        // Build toast structure using DOM methods (XSS-safe) / Xây dựng cấu trúc toast bằng phương thức DOM (an toàn XSS)
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'flex-shrink-0';
        iconWrapper.appendChild(createIconElement(icons[type]));

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'flex-1';
        contentWrapper.appendChild(createTextElement('h4', title, 'font-bold text-stone-900 text-sm'));
        contentWrapper.appendChild(createTextElement('p', message, 'text-stone-500 text-xs mt-0.5'));

        // Create close button with proper event listener (not inline onclick) / Tạo nút đóng với trình nghe sự kiện thích hợp
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-stone-300 hover:text-stone-500 transition-colors';
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('aria-label', 'Close notification');
        const closeIcon = createIconElement('x');
        closeIcon.className = 'w-4 h-4';
        closeBtn.appendChild(closeIcon);
        
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeToast(toast);
        });

        // Append all elements / Thêm tất cả các phần tử
        toast.appendChild(iconWrapper);
        toast.appendChild(contentWrapper);
        toast.appendChild(closeBtn);
        
        const progress = document.createElement('div');
        progress.className = 'toast-progress';
        toast.appendChild(progress);

        cont.appendChild(toast);
        lucide.createIcons();

        // Slide in animation / Hoạt ảnh trượt vào
        setTimeout(() => toast.classList.add('show'), 10);

        // Setup auto-dismiss with proper cleanup / Thiết lập tự động loại bỏ với dọn dẹp thích hợp
        const toastId = Symbol('toast');
        activeToasts.set(toastId, setTimeout(() => {
            removeToast(toast);
            activeToasts.delete(toastId);
        }, duration));
    };

    const removeToast = (toast) => {
        if (!toast.parentElement) return; // Already removed / Đã được xóa rồi
        
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 400);
    };

    // Cleanup on page unload / Dọn dẹp khi trang bị gỡ bỏ
    window.addEventListener('beforeunload', () => {
        activeToasts.forEach(timerId => clearTimeout(timerId));
        activeToasts.clear();
    });

    return Object.freeze({
        init,
        show,
        success: (title, msg) => show('success', title, msg),
        error: (title, msg) => show('error', title, msg),
        warning: (title, msg) => show('warning', title, msg),
        info: (title, msg) => show('info', title, msg),
    });
})();
