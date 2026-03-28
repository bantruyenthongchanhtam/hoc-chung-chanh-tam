/**
 * Member Service / Dịch Vụ Thành Viên
 * Manages member data loading, caching and transformation from Excel sheets
 * Quản lý tải dữ liệu thành viên, caching và chuyển đổi từ các sheet Excel
 * @author tbh
 */
const MemberService = (() => {
    /* =======================
       STATE / TRẠNG THÁI
       Member cache storage for each year
       Lưu trữ bộ nhớ cache thành viên cho mỗi năm
    ======================= */
    const CACHE = {
        "Tất cả": null,
        2025: null,
        2024: null,
        2023: null,
        2022: null,
        2021: null,
        2020: null,
        2019: null,
        2018: null,
        2017: null,
        2016: null,
        2015: null,
        2014: null,
        2013: null,
        2012: null,
        2011: null,
        2010: null,
        2009: null,
        2008: null,
        2007: null,
    };

    /**
     * Validate row structure / Xác thực cấu trúc hàng
     * @param {Array} row - Row data / Dữ liệu hàng
     * @returns {boolean} True if valid / Đúng nếu hợp lệ
     */
    const isValidRow = (row) => {
        return Array.isArray(row) && row.length >= 8 && 
               row.some(cell => cell !== null && cell !== undefined && cell !== "");
    };

    /**
     * Map row to Member object / Ánh xạ hàng thành đối tượng Member
     * @param {Array} row - Row data with 8 elements / Dữ liệu hàng có 8 phần tử
     * @returns {Member} Member object / Đối tượng Member
     * @throws {Error} If row structure is invalid / Nếu cấu trúc hàng không hợp lệ
     */
    const mapRowToMember = (row) => {
        if (!isValidRow(row)) {
            throw new Error(`Invalid row structure: expected 8 fields, got ${row.length}`);
        }

        return new Member(
            row[0] || "", // id / Mã định danh
            row[1] || "", // fullName / Tên đầy đủ
            row[2] || "", // name / Tên
            row[3] || "", // position / Vị trí
            row[4] || "", // group / Nhóm
            row[5] || "", // note / Ghi chú
            row[6] || "", // image / Hình ảnh
            row[7] || 0   // sort_order / Thứ tự sắp xếp (default to 0)
        );
    };

    /**
     * Load members for specific year with caching / Tải thành viên cho năm cụ thể với caching
     * @param {string|number} year - Year to load / Năm để tải
     * @returns {Promise<Array<Member>>} Array of members sorted by order / Mảng thành viên được sắp xếp theo thứ tự
     */
    const loadYear = async (year) => {
        try {
            if (CACHE[year]) return CACHE[year];

            let rows;

            if (year === Constant.ALL) {
                rows = await ExcelService.readAllSheet();
            } else {
                // Convert year to string for sheet lookup / Chuyển đổi năm thành chuỗi để tìm kiếm sheet
                rows = await ExcelService.readSheet(String(year));
            }

            // Validate rows data / Xác thực dữ liệu hàng
            if (!Array.isArray(rows)) {
                console.warn(`ExcelService.readSheet returned non-array for year ${year}`);
                CACHE[year] = [];
                return [];
            }

            if (rows.length === 0) {
                CACHE[year] = [];
                return [];
            }

            // Map and filter rows, with error handling for each row / Ánh xạ và lọc hàng, xử lý lỗi cho từng hàng
            const members = rows
                .filter(row => {
                    try {
                        return isValidRow(row);
                    } catch (e) {
                        console.warn('Invalid row skipped:', row);
                        return false;
                    }
                })
                .map(row => {
                    try {
                        return mapRowToMember(row);
                    } catch (error) {
                        console.error('Error mapping member row:', error);
                        return null;
                    }
                })
                .filter(member => member !== null) // Remove failed mappings / Xóa các ánh xạ thất bại
                .sort((a, b) => a.sortOrder - b.sortOrder); // Sort by order / Sắp xếp theo thứ tự

            CACHE[year] = members;
            return members;
        } catch (error) {
            console.error(`MemberService.loadYear(${year}) error:`, error);
            CACHE[year] = [];
            return [];
        }
    };

    /**
     * Get all years in sorted order / Lấy tất cả năm theo thứ tự sắp xếp
     * @returns {Array} Array of years with "Tất cả" first, then years descending / Mảng năm với "Tất cả" trước, sau đó năm giảm dần
     */
    const getAllYears = () =>
        Object.keys(CACHE).sort((a, b) => {
            if (a === Constant.ALL) return -1; // "Tất cả" always first / "Tất cả" luôn đầu tiên
            if (b === Constant.ALL) return 1;
            return Number(b) - Number(a); // Years in descending order / Năm theo thứ tự giảm dần
        });

    /**
     * Clear cache for specific year or all years / Xóa bộ nhớ cache cho năm cụ thể hoặc tất cả năm
     * @param {string|number} year - Year to clear, or undefined to clear all / Năm để xóa, hoặc không xác định để xóa tất cả
     */
    const clearCache = (year) => {
        if (year !== undefined) {
            CACHE[year] = null;
        } else {
            Object.keys(CACHE).forEach(key => {
                CACHE[key] = null;
            });
        }
        // Clear Excel service cache as well / Cũng xóa bộ nhớ cache dịch vụ Excel
        if (ExcelService.clearCache) {
            ExcelService.clearCache();
        }
    };

    return Object.freeze({
        getMembersByYear: loadYear,
        getAllYears,
        clearCache,
    });
})();
