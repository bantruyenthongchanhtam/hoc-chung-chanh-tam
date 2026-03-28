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

    return Object.freeze({
        EMPTY: "",
        NONE: "none",
        NAME_ASC: "name-asc",
        NAME_DESC: "name-desc",
        ITEMS_PER_PAGE: 8,
        DEFAULT_AVATAR: "./assets/image/USER.webp",
        TAB_LIMITS: TAB_LIMITS,
        MESSAGE: MESSAGE,
        CONFIG: CONFIG,
        FORM_IDS: FORM_IDS,
        FORM_LIMITS: FORM_LIMITS,
        ALL: "Tất cả",
    });
})();
