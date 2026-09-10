/**
 * Member Service / Dịch Vụ Thành Viên
 * Manages member data loading, caching and transformation from Excel sheets
 * Quản lý tải dữ liệu thành viên, caching và chuyển đổi từ các sheet Excel
 */
const MemberService = (() => {
    /* =======================
       STATE / TRẠNG THÁI
       Cache for the full member list loaded from the "DS" sheet
       Bộ nhớ cache cho danh sách thành viên đầy đủ tải từ sheet "DS"
    ======================= */
    let membersCache = null; // All members from the single "DS" sheet / Tất cả thành viên từ sheet "DS" duy nhất
    let yearsCache = null; // Unique years derived from members / Các năm duy nhất trích xuất từ thành viên

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
     * Check whether a year value is a valid number / Kiểm tra giá trị năm có phải là số hợp lệ
     * @param {*} year - Year value / Giá trị năm
     * @returns {boolean} True if numeric year / Đúng nếu là năm dạng số
     */
    const isValidYear = (year) => {
        return year !== null && year !== undefined && year !== "" && !Number.isNaN(Number(year));
    };

    /**
     * Map row to Member object / Ánh xạ hàng thành đối tượng Member
     * @param {Array} row - Row data with 9 elements / Dữ liệu hàng có 9 phần tử
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
            row[F.YEAR] || "",             // year / Năm kết nạp
            row[F.NOTE] || "",             // note / Ghi chú
            row[F.IMAGE] || "",            // image / Hình ảnh
            row[F.SORT_ORDER] || 0         // sort_order / Thứ tự sắp xếp (default to 0)
        );
    };

    /**
     * Load and cache all members from the "DS" sheet / Tải và lưu bộ nhớ cache tất cả thành viên từ sheet "DS"
     * @returns {Promise<Array<Member>>} Array of all members / Mảng tất cả thành viên
     */
    const loadAllMembers = async () => {
        try {
            if (membersCache) return membersCache;

            const rows = await ExcelService.readSheet(Constant.CONFIG.DATABASE.SHEET_NAME);

            if (!Array.isArray(rows) || rows.length === 0) {
                membersCache = [];
                return membersCache;
            }

            membersCache = rows
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

            return membersCache;
        } catch (error) {
            console.error('MemberService.loadAllMembers error:', error);
            membersCache = [];
            return membersCache;
        }
    };

    /**
     * Load members for specific year (or all) by filtering the cached member list
     * Tải thành viên cho năm cụ thể (hoặc tất cả) bằng cách lọc danh sách thành viên đã lưu cache
     * @param {string|number} year - Year to load, or Constant.ALL / Năm để tải, hoặc Constant.ALL
     * @returns {Promise<Array<Member>>} Array of members sorted by order / Mảng thành viên được sắp xếp theo thứ tự
     */
    const loadYear = async (year) => {
        try {
            const members = await loadAllMembers();

            if (year === Constant.ALL) return members;

            if (year === Constant.UNKNOWN_YEAR) {
                return members.filter(member => !isValidYear(member.year));
            }

            return members.filter(member => String(member.year) === String(year));
        } catch (error) {
            console.error(`MemberService.loadYear(${year}) error:`, error);
            return [];
        }
    };

    /**
     * Get all unique years present in the data, sorted descending / Lấy tất cả năm duy nhất có trong dữ liệu, sắp xếp giảm dần
     * @returns {Array} Array of years: "Tất cả", then years descending, then "Không rõ" if present / Mảng năm: "Tất cả", sau đó năm giảm dần, rồi "Không rõ" nếu có
     */
    const getAllYears = async () => {
        if (yearsCache) return yearsCache;

        const members = await loadAllMembers();
        const uniqueYears = [...new Set(
            members
                .map(member => member.year)
                .filter(isValidYear)
        )];

        uniqueYears.sort((a, b) => Number(b) - Number(a)); // Years in descending order / Năm theo thứ tự giảm dần

        const hasUnknownYear = members.some(member => !isValidYear(member.year));

        yearsCache = [
            Constant.ALL, // "Tất cả" always first / "Tất cả" luôn đầu tiên
            ...uniqueYears,
            ...(hasUnknownYear ? [Constant.UNKNOWN_YEAR] : []), // "Không rõ" always last / "Không rõ" luôn cuối cùng
        ];
        return yearsCache;
    };

    /**
     * Get only years that actually have member data / Lấy chỉ các năm thực sự có dữ liệu thành viên
     * Kept for backward compatibility with existing UI code
     * Giữ lại để tương thích ngược với code giao diện hiện tại
     * @returns {Promise<Array>} Array of years with data, including "Tất cả" / Mảng năm có dữ liệu, bao gồm "Tất cả"
     */
    const getYearsWithData = async () => {
        try {
            return await getAllYears();
        } catch (error) {
            console.error('MemberService.getYearsWithData error:', error);
            return [Constant.ALL]; // Return at least "Tất cả" on error / Trả về ít nhất "Tất cả" khi có lỗi
        }
    };

    /**
     * Clear cache manually / Xóa bộ nhớ cache theo cách thủ công
     */
    const clearCache = () => {
        membersCache = null;
        yearsCache = null;
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
