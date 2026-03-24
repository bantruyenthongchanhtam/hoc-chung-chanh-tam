/**
 * Member Service
 * @author tbh
 */
const MemberService = (() => {
    const CACHE = {
        "Tất cả": null,
        //2026: null,
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
     * Map row to Member Obj
     * @param {*} row
     * @returns
     */
    const mapRowToMember = (row) =>
        new Member(
            row[0], // id
            row[1], // fullName
            row[2], // name
            row[3], // position
            row[4], // group
            row[5], // note
            row[6], // image
            row[7] // sort_order
        );

    /**
     * Load year
     * @param {*} year
     * @returns
     */
    const loadYear = async (year) => {
        if (CACHE[year]) return CACHE[year];

        let rows;

        if (year === Constant.ALL) {
            rows = await ExcelService.readAllSheet();
        } else {
            rows = await ExcelService.readSheet(String(year));
        }

        if (!rows || rows.length <= 1) return [];
        const members = rows
            .filter((row) =>
                row.some(
                    (cell) => cell !== null && cell !== undefined && cell !== ""
                )
            )
            .map(mapRowToMember);
        CACHE[year] = members.sort((a, b) => a.sortOrder - b.sortOrder);

        return members;
    };

    /**
     * Get member by year
     * @param {*} year
     * @returns
     */
    const getMembersByYear = (year) => loadYear(year);

    /**
     * Get all years in cache
     *
     * @returns
     */
    const getAllYears = () =>
        Object.keys(CACHE).sort((a, b) => {
            if (a === Constant.ALL) return -1;
            if (b === Constant.ALL) return 1;
            return Number(b) - Number(a);
        });

    return Object.freeze({
        getMembersByYear,
        getAllYears,
    });
})();
