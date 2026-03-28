/**
 * Member Service / Dịch Vụ Thành Viên
 * Manages member data loading, caching and transformation from Excel sheets
 * Quản lý tải dữ liệu thành viên, caching và chuyển đổi từ các sheet Excel
 */
const MemberService = (() => {
    /* =======================
       STATE / TRẠNG THÁI
       Member cache storage for each year
       Lưu trữ bộ nhớ cache thành viên cho mỗi năm
    ======================= */
    // Create dynamic cache from year 2007 to current year / Tạo bộ nhớ cache động từ năm 2007 đến năm hiện tại
    const CACHE = (() => {
        const cache = { "Tất cả": null };
        const currentYear = new Date().getFullYear(); // Get current year / Lấy năm hiện tại
        // Generate years from current year down to START_YEAR / Tạo ra các năm từ năm hiện tại xuống START_YEAR
        for (let year = currentYear; year >= Constant.MEMBER.START_YEAR; year--) {
            cache[year] = null;
        }
        return cache;
    })();

    /**
     * Validate row structure / Xác thực cấu trúc hàng
     * @param {Array} row - Row data / Dữ liệu hàng
     * @returns {boolean} True if valid / Đúng nếu hợp lệ
     */
    const isValidRow = (row) => {
        return Array.isArray(row) && row.length >= Constant.MEMBER.ROW_MIN_LENGTH && 
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
            throw new Error(`Invalid row structure: expected ${Constant.MEMBER.ROW_MIN_LENGTH} fields, got ${row.length}`);
        }

        const F = Constant.MEMBER.FIELDS; // Alias for brevity / Bí danh cho ngắn gọn
        return new Member(
            row[F.ID] || "",               // id / Mã định danh
            row[F.FULL_NAME] || "",        // fullName / Tên đầy đủ
            row[F.NAME] || "",             // name / Tên
            row[F.POSITION] || "",         // position / Vị trí
            row[F.GROUP] || "",            // group / Nhóm
            row[F.NOTE] || "",             // note / Ghi chú
            row[F.IMAGE] || "",            // image / Hình ảnh
            row[F.SORT_ORDER] || 0         // sort_order / Thứ tự sắp xếp (default to 0)
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
     * Load and get only years that have member data / Tải và lấy chỉ các năm có dữ liệu member
     * Filters out years with no members to avoid showing empty tabs
     * Loại bỏ các năm không có member để tránh hiển thị tab trống
     * @returns {Promise<Array>} Array of years with data, including "Tất cả" / Mảng năm có dữ liệu, bao gồm "Tất cả"
     */
    const getYearsWithData = async () => {
        try {
            const allYearsList = getAllYears();
            const yearsWithData = [Constant.ALL]; // Always include "Tất cả" / Luôn bao gồm "Tất cả"

            // Load data for each year and check if it has members / Tải dữ liệu cho từng năm và kiểm tra nó có member không
            for (const year of allYearsList) {
                if (year === Constant.ALL) continue; // Skip "Tất cả" as already added / Bỏ qua "Tất cả" vì đã thêm

                const members = await loadYear(year);
                if (Array.isArray(members) && members.length > 0) {
                    yearsWithData.push(year);
                }
            }

            return yearsWithData;
        } catch (error) {
            console.error('MemberService.getYearsWithData error:', error);
            return [Constant.ALL]; // Return at least "Tất cả" on error / Trả về ít nhất "Tất cả" khi có lỗi
        }
    };

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
        getYearsWithData,
        clearCache,
    });
})();
