/**
 * Member Service / Dịch Vụ Thành Viên
 * Loads member data from public/data.json (converted from data.xlsx by scripts/convert-data.js)
 * Tải dữ liệu thành viên từ public/data.json (được chuyển từ data.xlsx bởi scripts/convert-data.js)
 */
const MemberService = (() => {
    /* =======================
       STATE / TRẠNG THÁI
       Cache for the full member list / Bộ nhớ cache danh sách thành viên
    ======================= */
    let membersCache = null;
    let cacheTimestamp = null;
    let yearsCache = null; // Unique years derived from members / Các năm duy nhất trích xuất từ thành viên
    const MAX_CACHE_TIME = Constant.CONFIG.DATABASE.CACHE_TIME_MS;
    const DATA_URL = Constant.CONFIG.DATABASE.DATA_JSON_URL;

    /**
     * Invalidate cache if expired / Làm mất hiệu lực cache nếu hết hạn
     */
    const invalidateCacheIfExpired = () => {
        if (membersCache && cacheTimestamp && Date.now() - cacheTimestamp > MAX_CACHE_TIME) {
            membersCache = null;
            yearsCache = null;
            cacheTimestamp = null;
        }
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
     * Map JSON row to Member object / Ánh xạ dòng JSON thành đối tượng Member
     * @param {Object} row - Member row from data.json / Dòng dữ liệu từ data.json
     * @returns {Member|null} Member object, or null if the row is empty / Đối tượng Member, hoặc null nếu dòng rỗng
     */
    const mapRowToMember = (row) => {
        if (!row || typeof row !== 'object') return null;

        const hasData = [
            row.id, row.fullName, row.name, row.nickName, row.position,
            row.group, row.year, row.note, row.img, row.sortOrder,
        ].some((cell) => cell !== null && cell !== undefined && cell !== '');
        if (!hasData) return null;

        return new Member(
            row.id || '',            // id / Mã định danh
            row.fullName || '',      // fullName / Tên đầy đủ
            row.name || '',          // name / Tên
            row.nickName || '',      // nickName / Biệt danh
            row.position || '',      // position / Vị trí
            row.group || '',         // group / Nhóm
            row.year || '',          // year / Năm kết nạp
            row.note || '',          // note / Ghi chú
            row.img || '',           // image / Hình ảnh
            row.sortOrder || 0       // sort_order / Thứ tự sắp xếp (default to 0)
        );
    };

    /**
     * Load and cache all members from data.json / Tải và cache tất cả thành viên từ data.json
     * @returns {Promise<Array<Member>>} Array of all members sorted by order / Mảng thành viên sắp xếp theo thứ tự
     */
    const loadAllMembers = async () => {
        try {
            invalidateCacheIfExpired();
            if (membersCache) return membersCache;

            // "default" lets the browser reuse the <link rel="preload"> response and
            // conditional HTTP caching (304) instead of re-downloading the file
            // "default" cho phép tái dùng phản hồi preload và cache HTTP có điều kiện (304)
            const response = await fetch(DATA_URL, { cache: "default" });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const rows = Array.isArray(data && data.members) ? data.members : [];

            membersCache = rows
                .map((row) => {
                    try {
                        return mapRowToMember(row);
                    } catch (error) {
                        console.error('Error mapping member row:', error);
                        return null;
                    }
                })
                .filter((member) => member !== null) // Remove failed mappings / Xóa các ánh xạ thất bại
                .sort((a, b) => a.sortOrder - b.sortOrder); // Sort by order / Sắp xếp theo thứ tự
            cacheTimestamp = Date.now();

            return membersCache;
        } catch (error) {
            console.error('MemberService.loadAllMembers error:', error);
            // Show user-friendly error / Hiển thị lỗi thân thiện với người dùng
            Toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách thành viên. Vui lòng tải lại trang.');
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
     * Clear cache manually / Xóa bộ nhớ cache theo cách thủ công
     */
    const clearCache = () => {
        membersCache = null;
        yearsCache = null;
        cacheTimestamp = null;
    };

    return Object.freeze({
        getMembersByYear: loadYear,
        getAllYears,
        clearCache,
    });
})();
