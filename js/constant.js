const Constant = (() => {
    const TAB_LIMITS = {
        MOBILE: 3,
        DESKTOP: 5,
    };

    const MESSAGE = {
        ERROR: {},
        WARNING: {},
    };

    return Object.freeze({
        EMPTY: "",
        NONE: "none",
        NAME_ASC: "name-asc",
        NAME_DESC: "name-desc",
        ITEMS_PER_PAGE: 8,
        DEFAULT_AVATAR: "./images/USER.png",
        TAB_LIMITS: TAB_LIMITS,
        MESSAGE: MESSAGE,
        DATA_EXCEL_URL: "./data/DATA.xlsx",
    });
})();
