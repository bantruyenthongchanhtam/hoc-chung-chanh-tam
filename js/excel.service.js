const ExcelService = (() => {
    /* =======================
       CONFIG
    ======================= */
    const EXCEL_URL = Constant.DATA_EXCEL_URL;

    /* =======================
       STATE
    ======================= */
    let workbookCache = null;

    /* =======================
       PRIVATE METHODS
    ======================= */
    const loadWorkbook = async () => {
        if (workbookCache) return workbookCache;

        const response = await fetch(EXCEL_URL, {
            cache: "no-store",
        });
        if (!response.ok) {
            throw new Error("Không thể tải file Excel");
        }

        const buffer = await response.arrayBuffer();
        workbookCache = XLSX.read(buffer, { type: "array" });

        return workbookCache;
    };

    const getSheet = async (sheetName) => {
        const workbook = await loadWorkbook();

        if (!workbook.SheetNames.includes(sheetName)) {
            return [];
        }

        return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1,
        });
    };

    /* =======================
       PUBLIC API
    ======================= */
    return {
        readSheet: getSheet,
    };
})();
