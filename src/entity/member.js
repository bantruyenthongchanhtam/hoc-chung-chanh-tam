/**
 * Member Model / Mô Hình Thành Viên
 * Represents a member/person in the organization with all their properties
 * Đại diện cho một thành viên/người trong tổ chức với tất cả các thuộc tính của họ
 * 
 * @class Member
 */
class Member {
    /**
     * Initialize new Member instance / Khởi tạo instance Member mới
     * 
     * @param {string} id - Unique identifier / Mã định danh duy nhất
     * @param {string} fullName - Full name with diacritics / Tên đầy đủ có dấu
     * @param {string} name - Short name / Tên rút gọn
     * @param {string} position - Job position / Chức vụ
     * @param {string} group - Organization group / Nhóm tổ chức
     * @param {string} note - Additional notes / Ghi chú bổ sung
     * @param {string} img - Avatar image URL / URL hình ảnh đại diện
     * @param {number} sortOrder - Display order index / Chỉ số thứ tự hiển thị
     */
    constructor(id, fullName, name, position, group, note, img, sortOrder) {
        this.id = id;                           // Unique identifier / Mã định danh duy nhất
        this.fullName = fullName;               // Full name with diacritics / Tên đầy đủ có dấu
        this.name = name;                       // Short name / Tên rút gọn
        this.position = position;               // Job position / Chức vụ
        this.group = group;                     // Organization group / Nhóm tổ chức
        this.note = note;                       // Additional notes / Ghi chú bổ sung
        this.img = img;                         // Avatar image URL / URL hình ảnh đại diện
        this.sortOrder = sortOrder || 0;        // Display order, default to 0 / Thứ tự hiển thị, mặc định 0
    }
}
