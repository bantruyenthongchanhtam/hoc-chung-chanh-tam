const Constant = (() => {
    const TAB_LIMITS = {
        MOBILE: 3,
        DESKTOP: 5,
    };

    const MESSAGE = {
        ERROR: {
            MSG_001: 'Vui lòng nhập nội dung',
            MSG_002: 'Gửi tin nhắn thất bại. Vui lòng thử lại.',
        },
        WARNING: {},
        SUCCESS: {
            MSG_001: "Gửi tin nhắn thành công!"
        },
    };

    const CONFIG = {
        GOOGLE_FORM : {
            ENTRY_ID: 'entry.1611862614',
            FORM_ID: '1FAIpQLSflwYMViQ1H06TmKg-LdaBDdEoqA57Js2fefctUBVrMlXNabg',
        },
        DATABASE: {
            DATA_EXCEL_URL: "./data/DATA.xlsx",
            CACHE_TIME_MS: 5 * 60 * 1000, // Excel workbook cache TTL (5 minutes) / Bộ nhớ cache sổ làm việc Excel (5 phút)
        }
    };

    const FORM_IDS = {
        MODAL: 'formModal',
        INPUT: 'messageInput',
        FORM: 'confessionForm',
        HIDDEN_IFRAME: 'hidden_iframe',
    };

    const FORM_LIMITS = {
        MESSAGE_MIN_LENGTH: 1,
        MESSAGE_MAX_LENGTH: 500, // Google Forms input limit / Giới hạn input Google Forms
    };

    const MEMBER = {
        // Year range configuration / Cấu hình phạm vi năm
        START_YEAR: 2008, // Starting year for member data / Năm bắt đầu cho dữ liệu member
        
        // Member field indices in Excel rows (0-based) / Chỉ số trường member trong hàng Excel (dựa trên 0)
        FIELDS: {
            ID: 0,              // id / Mã định danh
            FULL_NAME: 1,       // fullName / Tên đầy đủ
            NAME: 2,            // name / Tên
            POSITION: 3,        // position / Vị trí
            GROUP: 4,           // group / Nhóm
            NOTE: 5,            // note / Ghi chú
            IMAGE: 6,           // image / Hình ảnh
            SORT_ORDER: 7,      // sort_order / Thứ tự sắp xếp
        },
        
        // Row validation / Xác thực hàng
        ROW_MIN_LENGTH: 8, // Minimum number of fields required / Số lượng trường tối thiểu yêu cầu
    };

    return Object.freeze({
        EMPTY: "",
        NONE: "none",
        NAME_ASC: "name-asc",
        NAME_DESC: "name-desc",
        ITEMS_PER_PAGE: 8,
        DEFAULT_AVATAR: "./assets/images/user.webp",
        TAB_LIMITS: TAB_LIMITS,
        MESSAGE: MESSAGE,
        CONFIG: CONFIG,
        FORM_IDS: FORM_IDS,
        FORM_LIMITS: FORM_LIMITS,
        MEMBER: MEMBER,
        ALL: "Tất cả",
    });
})();
