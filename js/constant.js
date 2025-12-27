const Constant = (() => {
    const TAB_LIMITS = {
        MOBILE: 3,
        DESKTOP: 5,
    };

    const MESSAGE = {
        ERROR: {
            MSG_001: 'Vui lòng nhập nội dung',
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
    }

    return Object.freeze({
        EMPTY: "",
        NONE: "none",
        NAME_ASC: "name-asc",
        NAME_DESC: "name-desc",
        ITEMS_PER_PAGE: 8,
        DEFAULT_AVATAR: "./images/USER.png",
        TAB_LIMITS: TAB_LIMITS,
        MESSAGE: MESSAGE,
        CONFIG: CONFIG,
    });
})();
