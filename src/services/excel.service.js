const ExcelService = (() => {
    /* =======================
       CONFIG / CẤU HÌNH
       Excel file URL configuration
       Cấu hình URL tệp Excel
    ======================= */
    const EXCEL_URL = Constant.CONFIG.DATABASE.DATA_EXCEL_URL;

    /* =======================
       STATE / TRẠNG THÁI
       Workbook cache and error tracking
       Bộ nhớ cache sổ làm việc và theo dõi lỗi
    ======================= */
    let workbookCache = null;
    const MAX_CACHE_TIME = Constant.CONFIG.DATABASE.CACHE_TIME_MS; // Excel workbook cache TTL / Bộ nhớ cache sổ làm việc TTL
    let cacheTimestamp = null;

    /* =======================
       PRIVATE METHODS / PHƯƠNG THỨC RIÊNG
       Internal functions for Excel operations
       Các hàm nội bộ để thực hiện các hoạt động Excel
    ======================= */
    
    /**
     * Invalidate cache if expired / Làm mất hiệu lực bộ nhớ cache nếu hết hạn
     */
    const invalidateCacheIfExpired = () => {
        if (workbookCache && cacheTimestamp && Date.now() - cacheTimestamp > MAX_CACHE_TIME) {
            workbookCache = null;
            cacheTimestamp = null;
        }
    };

    /**
     * Load Excel workbook with error handling / Tải sổ làm việc Excel với xử lý lỗi
     * @returns {Promise<Object>} Workbook object / Đối tượng sổ làm việc
     * @throws {Error} If fetch or XLSX parse fails / Nếu fetch hoặc XLSX parse thất bại
     */
    const loadWorkbook = async () => {
        try {
            invalidateCacheIfExpired();
            
            if (workbookCache) return workbookCache;

            const response = await fetch(EXCEL_URL, {
                cache: "no-store",
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            
            if (!buffer || buffer.byteLength === 0) {
                throw new Error('Empty file received');
            }

            try {
                workbookCache = XLSX.read(buffer, { type: "array" });
                cacheTimestamp = Date.now();
            } catch (parseError) {
                throw new Error(`Failed to parse Excel file: ${parseError.message}`);
            }

            return workbookCache;
        } catch (error) {
            console.error('ExcelService.loadWorkbook error:', error);
            // Show user-friendly error / Hiển thị lỗi thân thiện với người dùng
            Toast.error('Lỗi tải dữ liệu', 'Không thể tải file Excel. Vui lòng tải lại trang.');
            throw error;
        }
    };

    /**
     * Get specific sheet data with validation / Lấy dữ liệu sheet cụ thể với xác thực
     * @param {string} sheetName - Sheet name / Tên sheet
     * @returns {Promise<Array>} Array of rows / Mảng hàng
     */
    const getSheet = async (sheetName) => {
        try {
            const workbook = await loadWorkbook();

            if (!workbook.SheetNames || !Array.isArray(workbook.SheetNames)) {
                console.warn('Invalid workbook structure');
                return [];
            }

            if (!workbook.SheetNames.includes(sheetName)) {
                console.warn(`Sheet "${sheetName}" not found`);
                return [];
            }

            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                console.warn(`Sheet object "${sheetName}" is null`);
                return [];
            }

            return XLSX.utils
                .sheet_to_json(sheet, { header: 1 })
                .slice(1); // Skip header row / Bỏ qua hàng tiêu đề
        } catch (error) {
            console.error(`ExcelService.getSheet("${sheetName}") error:`, error);
            return [];
        }
    };

    /**
     * Get data from all sheets with validation / Lấy dữ liệu từ tất cả sheet với xác thực
     * @returns {Promise<Array>} Combined array of all rows / Mảng kết hợp của tất cả hàng
     */
    const getDataAllSheet = async () => {
        try {
            const workbook = await loadWorkbook();

            if (!workbook.SheetNames || !Array.isArray(workbook.SheetNames)) {
                console.warn('Invalid workbook structure');
                return [];
            }

            return workbook.SheetNames.flatMap((name) => {
                try {
                    const sheet = workbook.Sheets[name];
                    if (!sheet) return [];

                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    
                    if (!Array.isArray(rows) || rows.length <= 1) return [];
                    return rows.slice(1);
                } catch (sheetError) {
                    console.warn(`Error reading sheet "${name}":`, sheetError);
                    return [];
                }
            });
        } catch (error) {
            console.error('ExcelService.getDataAllSheet error:', error);
            return [];
        }
    };

    /**
     * Clear cache manually / Xóa bộ nhớ cache theo cách thủ công
     */
    const clearCache = () => {
        workbookCache = null;
        cacheTimestamp = null;
    };

    /* =======================
       PUBLIC API / API CÔNG KHAI
    ======================= */
    return Object.freeze({
        readSheet: getSheet,
        readAllSheet: getDataAllSheet,
        clearCache,
    });
})();
