const ExcelService = (() => {
    /* =======================
       CONFIG
    ======================= */
    const EXCEL_URL = Constant.CONFIG.DATABASE.DATA_EXCEL_URL;

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

    const getDataAllSheet = async () => {
        const workbook = await loadWorkbook();
    
        return workbook.SheetNames.flatMap((name) => {
            const rows = XLSX.utils.sheet_to_json(
                workbook.Sheets[name],
                { header: 1 }
            );
    
            if (rows.length <= 1) return []; // chỉ có header
    
            return rows.slice(1);
        });
    };

    /* =======================
       PUBLIC API
    ======================= */
    return {
        readSheet: getSheet,
        readAllSheet: getDataAllSheet,
    };
})();
