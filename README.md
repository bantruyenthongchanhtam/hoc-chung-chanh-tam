# Học Chúng Chánh Tâm - Tự viện Phước Duyên

## Ứng dụng quản lý và tra cứu danh sách thành viên học chúng Chánh Tâm

![Microsoft Excel](https://img.shields.io/badge/Data_Source-Excel-217346?style=flat-square&logo=microsoft-excel)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

## 🔗 Website

```
👉 [Xem tại đây](https://bantruyenthongchanhtam.github.io/hoc-chung-chanh-tam)
```
## 📂 Cấu trúc thư mục (Project Structure)

```
.
├── 📁 .git/                        # Các cấu hình cho GitHub
├── 📁 assets/                      # Tài nguyên tĩnh (Hình ảnh, Logo, Icons)
│   ├── 📁 css/                     # Các thành phần UI tái sử dụng
│   │   └──style.css
│   ├── 📁 image/                   # Các thành phần hình ảnh tái sử dụng
│   │   ├──favicon.png
│   │   ├──logo.png
│   │   └──thumbnail.jpg
│   └── 📁 music/                   # Các thành phần âm thanh
│       └──BACKGROUND_MUSIC.MP3
├── 📁 data/                        # Thư mục dữ liệu   
│   └── 📊 DATA.xlsx                # File excel chứa dữ liệu thành viên
├── 📁 src/                         # Mã nguồn chính (Source code)
│   ├── 📁 common/                  # Các thành phần tái sử dụng
│   │   ├──constant.js
│   │   ├──modal.js
│   │   └──toast.js
│   ├── 📁 entity/                  # Đối tượng dữ liệu
│   │   └──member.js
│   ├── 📁 services/                # Xử lý Logic nghiệp vụ
│   │   ├──excel.service.js
│   │   └──member.service.js
│   └── 📄 script.js                # Xử lý Logic nghiệp vụ chính
├── index.html                      # File HTML chính
└── 📄 README.md                    # File hướng dẫn này

```
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Excel](https://img.shields.io/badge/Microsoft_Excel-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white)

```
## 🚀 Hướng dẫn cho nhà phát triển
1. Clone dự án về máy: `git clone https://github.com/bantruyenthongchanhtam/hoc-chung-chanh-tam.git`
2. Mở file `index.html` trên trình duyệt để kiểm tra (hoặc dùng Live Server trong VS Code).
3. Các cấu hình hằng số (Constants) có thể chỉnh sửa tại `src/common/constant.js`.

---
© 2026 Ban Truyền Thông Chánh Tâm