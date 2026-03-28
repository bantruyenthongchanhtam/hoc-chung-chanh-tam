/**
 * Modal Service / Dịch Vụ Modal
 * Handles confession form modal with validation, accessibility and error handling
 * Xử lý modal biểu mẫu tường số với xác thực, khả năng truy cập và xử lý lỗi
 */
const Modal = (() => {
    const IDS = Constant.FORM_IDS;
    const LIMITS = Constant.FORM_LIMITS;
    
    /**
     * Get modal element / Lấy phần tử modal
     */
    const getModal = () => document.getElementById(IDS.MODAL);
    
    /**
     * Get form element / Lấy phần tử biểu mẫu
     */
    const getForm = () => document.getElementById(IDS.FORM);
    
    /**
     * Get message input element / Lấy phần tử nhập thông báo
     */
    const getInput = () => document.getElementById(IDS.INPUT);

    /**
     * Open modal with accessibility support / Mở modal với hỗ trợ khả năng truy cập
     */
    const open = () => {
        const modal = getModal();
        if (!modal) {
            console.error(`Modal element with id "${IDS.MODAL}" not found`);
            return;
        }
        
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        
        // Focus input for better UX / Tập trung vào input để UX tốt hơn
        setTimeout(() => {
            const input = getInput();
            if (input) input.focus();
        }, 100);
    };

    /**
     * Close modal and restore scroll / Đóng modal và khôi phục cuộn
     */
    const close = () => {
        const modal = getModal();
        if (!modal) return;
        
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    };

    /**
     * Validate message input / Xác thực nhập thông báo
     * @param {string} message - Message to validate / Thông báo để xác thực
     * @returns {Object} Validation result / Kết quả xác thực
     */
    const validateMessage = (message) => {
        const trimmed = message.trim();
        
        if (trimmed.length < LIMITS.MESSAGE_MIN_LENGTH) {
            return {
                valid: false,
                error: Constant.MESSAGE.ERROR.MSG_001,
            };
        }
        
        if (trimmed.length > LIMITS.MESSAGE_MAX_LENGTH) {
            return {
                valid: false,
                error: `Tin nhắn không được quá ${LIMITS.MESSAGE_MAX_LENGTH} ký tự`,
            };
        }
        
        return { valid: true };
    };

    /**
     * Submit form to Google Forms with error handling / Gửi biểu mẫu tới Google Forms với xử lý lỗi
     * @param {Event} event - Form submit event / Sự kiện gửi biểu mẫu
     */
    const submit = async (event) => {
        event.preventDefault();

        const input = getInput();
        if (!input) {
            console.error(`Input element with id "${IDS.INPUT}" not found`);
            Toast.error('Lỗi', 'Không thể tìm thấy trường nhập');
            return;
        }

        const message = input.value;
        const validation = validateMessage(message);
        
        if (!validation.valid) {
            Toast.error('Lỗi', validation.error);
            return;
        }

        try {
            const entryId = Constant.CONFIG.GOOGLE_FORM.ENTRY_ID;
            const formId = Constant.CONFIG.GOOGLE_FORM.FORM_ID;

            if (!entryId || !formId) {
                throw new Error('Google Form configuration is missing');
            }

            const submitUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

            // Create temporary form for submission / Tạo biểu mẫu tạm thời để gửi
            const form = document.createElement("form");
            form.method = "POST";
            form.action = submitUrl;
            form.target = IDS.HIDDEN_IFRAME;

            const hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.name = entryId;
            hiddenInput.value = message.trim();

            form.appendChild(hiddenInput);
            document.body.appendChild(form);

            // Submit form with error handling / Gửi biểu mẫu với xử lý lỗi
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Form submission timeout'));
                }, 10000); // 10 second timeout / Hết thời gian 10 giây

                form.onsubmit = () => {
                    clearTimeout(timeout);
                    resolve();
                };

                form.submit();
            });

            // Cleanup form / Dọn dẹp biểu mẫu
            document.body.removeChild(form);

            // Reset and close / Đặt lại và đóng
            const confessionForm = getForm();
            if (confessionForm) confessionForm.reset();
            
            close();
            Toast.success('Thành công', Constant.MESSAGE.SUCCESS.MSG_001);

        } catch (error) {
            console.error('Form submission error:', error);
            Toast.error('Lỗi', Constant.MESSAGE.ERROR.MSG_002);
        }
    };

    /**
     * Setup keyboard handlers for accessibility / Thiết lập trình xử lý bàn phím để khả năng truy cập
     */
    const setupKeyboardHandlers = () => {
        document.addEventListener('keydown', (e) => {
            // Close modal on Escape key / Đóng modal khi nhấn phím Escape
            if (e.key === 'Escape') {
                close();
            }
        });
    };

    /**
     * Initialize modal event listeners / Khởi tạo trình nghe sự kiện modal
     */
    const init = () => {
        setupKeyboardHandlers();
        
        const form = getForm();
        if (form) {
            form.addEventListener('submit', submit);
        } else {
            console.warn(`Form element with id "${IDS.FORM}" not found`);
        }

        const modal = getModal();
        if (!modal) {
            console.warn(`Modal element with id "${IDS.MODAL}" not found`);
        }
    };

    // Call init when module loads / Gọi init khi module tải
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return Object.freeze({
        open,
        close,
        submit,
        init,
    });
})();

// Expose global functions for HTML onclick / Tiếp xúc hàm toàn cục cho onclick HTML
const openModal = () => Modal.open();
const closeModal = () => Modal.close();
const submitForm = (event) => Modal.submit(event);