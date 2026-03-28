<!-- Tiêu đề chính / Main Title -->
# Học Chúng Chánh Tâm - Tự viện Phước Duyên

<!-- Mô tả ứng dụng / Application Description -->
## Ứng dụng quản lý và tra cứu danh sách thành viên học chúng Chánh Tâm

<!-- Badges trạng thái / Status Badges -->
![Microsoft Excel](https://img.shields.io/badge/Data_Source-Excel-217346?style=flat-square&logo=microsoft-excel)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

<!-- Liên kết website / Website Link -->
## 🔗 Website

```
https://bantruyenthongchanhtam.github.io/hoc-chung-chanh-tam
```

<!-- Cấu trúc thư mục / Project Structure -->
## 📂 Cấu trúc thư mục (Project Structure)

```
.
├── 📁 .git/                        # Các cấu hình cho GitHub / GitHub configurations
├── 📁 assets/                      # Tài nguyên tĩnh (Hình ảnh, Logo, Icons) / Static assets (Images, Logo, Icons)
│   ├── 📁 css/                     # Các thành phần UI tái sử dụng / Reusable UI components
│   │   └──style.css
│   ├── 📁 image/                   # Các thành phần hình ảnh tái sử dụng / Reusable image components
│   │   ├──favicon.png
│   │   ├──logo.png
│   │   └──thumbnail.jpg
│   └── 📁 music/                   # Các thành phần âm thanh / Audio components
│       └──BACKGROUND_MUSIC.MP3
├── 📁 data/                        # Thư mục dữ liệu / Data directory
│   └── 📊 DATA.xlsx                # File excel chứa dữ liệu thành viên / Excel file containing member data
├── 📁 src/                         # Mã nguồn chính (Source code) / Main source code
│   ├── 📁 common/                  # Các thành phần tái sử dụng / Reusable components
│   │   ├──constant.js
│   │   ├──modal.js
│   │   └──toast.js
│   ├── 📁 entity/                  # Đối tượng dữ liệu / Data entities
│   │   └──member.js
│   ├── 📁 services/                # Xử lý Logic nghiệp vụ / Business logic services
│   │   ├──excel.service.js
│   │   └──member.service.js
│   └── 📄 script.js                # Xử lý Logic nghiệp vụ chính / Main business logic script
├── index.html                      # File HTML chính / Main HTML file
└── 📄 README.md                    # File hướng dẫn này / This documentation file

```

<!-- Công nghệ sử dụng / Technologies Used -->
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Excel](https://img.shields.io/badge/Microsoft_Excel-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white)

<!-- Hướng dẫn sắp xếp / Sorting Guide -->
## 📋 Hướng dẫn sắp xếp thành viên (Sorting Guide)

Thứ tự ưu tiên sắp xếp (sortOrder) như sau:

| Thứ tự | Vai trò / Role |
|--------|----------------|
| 0      | Ôn |
| 1      | Quý Thầy |
| 2      | Lớp trưởng |
| 3      | Trưởng ban |
| 4      | Ban chấp hành |
| 5      | Ban cố vấn thường trực |
| 6      | Thành viên thường trực |
| 7      | Ban cố vấn không thường trực |
| 8      | Quý dì |
| 9      | Thành viên không thường trực |
| 10     | Thành viên không rõ |

Thứ tự này được sử dụng để sắp xếp thành viên theo vai trò trong tổ chức.

---
<!-- Bản quyền / Copyright -->
© 2026 Ban Truyền Thông Chánh Tâm