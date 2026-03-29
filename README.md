# Học Chúng Chánh Tâm - Tự viện Phước Duyên

> "Nguyện sống bằng cả trái tim, sống và làm việc bằng tâm chân chánh"  
> A member directory website for Tự viện Phước Duyên (Huế, Vietnam)

## 🏗️ Cấu Trúc Dự Án (Project Structure)

Dự án đã được tổ chức lại vì khả năng bảo trì tốt hơn trong khi vẫn duy trì hiệu suất tối ưu:

```
hoc-chung-chanh-tam/
├── 📄 index.html                    # Main HTML entry point
├── 📄 README.md                     # This file
│
├── 📁 src/                          # Application source code
│   ├── 📁 core/                     # Core configuration and constants
│   │   └── constants.js             # Centralized configuration values
│   │
│   ├── 📁 models/                   # Data models and entities
│   │   └── member.js                # Member class definition
│   │
│   ├── 📁 services/                 # Business logic and data access
│   │   ├── excel.service.js         # Excel file loading and caching
│   │   └── member.service.js        # Member data operations
│   │
│   ├── 📁 ui/                       # UI components and utilities
│   │   ├── modal.js                 # Confession form modal component
│   │   └── toast.js                 # Toast notification system
│   │
│   └── 📁 app/                      # Main application logic
│       └── script.js                # Main application script (~800 lines)
│
├── 📁 assets/                       # Static assets
│   ├── 📁 styles/                   # CSS stylesheets
│   │   └── style.css                # Main styles with Tailwind + custom CSS
│   │
│   ├── 📁 libs/                     # External JavaScript libraries
│   │   ├── lucide.min.js            # Icon library (minified)
│   │   └── xlsx.full.min.js         # Excel parsing library (minified)
│   │
│   ├── 📁 images/                   # Image assets
│   │   └── ...                      # Logo, favicon, and UI images
│   │
│   └── 📁 audio/                    # Audio files
│       └── BACKGROUND_MUSIC.MP3     # Background music
│
├── 📁 public/                       # Public data files
│   ├── data.xlsx                    # Member database (Excel format)
│   └── 📁 member-images/            # Member profile pictures
│       ├── 2008/
│       ├── 2009/
│       └── ...                      # Years organized by membership year
│
├── 📁 config/                       # Configuration files (for future use)
│
└── 📁 docs/                         # Documentation (for future use)
```

## 🧩 Kiến Trúc Thành Phần (Component Architecture)

### Luồng Dữ Liệu (Data Flow)
```
index.html
    ↓
Core Config (constants.js)
    ↓
Models (member.js)
    ↓
Services (excel.service.js, member.service.js)
    ↓
UI Components (modal.js, toast.js)
    ↓
Main App (script.js)
```

### Trách Nhiệm Tập Tin (File Responsibilities)

| Folder | Files | Purpose |
|--------|-------|---------|
| `src/core/` | `constants.js` | Centralized configuration, API URLs, cache settings, member field mappings |
| `src/models/` | `member.js` | Member class definition with 8 properties (id, fullName, name, position, group, note, img, sortOrder) |
| `src/services/` | `excel.service.js` | Loads and caches Excel files with 5-minute TTL |
| | `member.service.js` | Handles member data operations, filtering, dynamic year detection |
| `src/ui/` | `modal.js` | Confession form modal (Google Forms integration) |
| | `toast.js` | Notification system with 4 types (success, error, warning, info) |
| `src/app/` | `script.js` | Main application logic (search, filtering, pagination, music player) |
| `assets/styles/` | `style.css` | Tailwind CSS + custom styles for components |
| `assets/libs/` | `lucide.min.js`, `xlsx.full.min.js` | External libraries |
| `public/` | `data.xlsx` | Member database |

## ⚙️ Cấu Hình (Configuration)

All magic numbers and URLs are centralized in `src/core/constants.js`:

```javascript
// Database
DATA_EXCEL_URL: "./public/data.xlsx"

// UI
DEFAULT_AVATAR: "./assets/images/user.webp"
ITEMS_PER_PAGE: 8

// Member data
START_YEAR: 2008
ROW_MIN_LENGTH: 8
FIELDS: { ID: 0, FULL_NAME: 1, ... }

// Cache
CACHE_TIME_MS: 5 * 60 * 1000  // 5 minutes
```

## 🚀 Tối Ưu Hóa Tải (Loader Optimization)

The project maintains **4-5 HTTP requests** for optimal GitHub Pages performance:

1. `index.html` (entry)
2. `constants.js` (config)
3. `bundle.js` (models + services + UI + app)
4. `style.css` (styles)
5. `data.xlsx` (dynamic data)

This approach balances **code organization** with **loading speed**.

## 📊 Định Dạng Dữ Liệu (Data Format - Excel)

The `data.xlsx` file contains member information:

| ID | Full Name | Name | Position | Group | Note | Image | Sort Order |
|----|-----------|------|----------|-------|------|-------|------------|
| 1 | Nguyễn Văn A | A | Ban chấp hành | Tâm An | Notes | 2008/01.jpg | 4 |
| 2 | ... | ... | ... | ... | ... | ... | ... |

- **Image paths** are stored as relative paths: `2008/01.jpg` or similar
- **Dynamic year detection** happens via `MemberService.getYearsWithData()`
- Only years with actual member records appear in the UI

## 🎨 Các Tính Năng Giao Diện (UI Features)

### Components
- **Profile Cards**: Responsive grid layout with hover effects
- **Year Tabs**: Scrollable tab navigation with smart pagination
- **Search**: Diacritic-insensitive Vietnamese text search
- **Filters**: Group filtering and sort options
- **Pagination**: Configurable items-per-page
- **Modal**: Confession form with Google Forms integration
- **Toast**: Styled notifications for user feedback
- **Music Player**: Background audio with volume control

### Styling
- **Framework**: Tailwind CSS (CDN)
- **Icons**: Lucide (minified)
- **Colors**: Orange-based theme with custom CSS variables
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design

## 🔧 Hướng dẫn Phát Triển (Development Guide)

### Adding New Members
1. Edit `public/data.xlsx`
2. Add rows with ID, name, position, group, note, image path, sort order
3. Images should be placed in `public/member-images/{year}/`
4. Reload the page - new members appear automatically

### Modifying Constants
Edit `src/core/constants.js` to change:
- API URLs (`DATA_EXCEL_URL`, Google Form ID)
- UI defaults (`ITEMS_PER_PAGE`, `DEFAULT_AVATAR`)
- Member field mappings (`FIELDS`)
- Cache duration (`CACHE_TIME_MS`)

### Debugging
- Check browser console for errors
- Verify `DATA_EXCEL_URL` is accessible (should be in `public/`)
- Confirm image paths in Excel match actual file locations
- Check cache is invalidating properly (5-min refresh)

## 📋 Hướng dẫn sắp xếp (Sorting Guide)

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

## 📈 Performance Notes

### Load Time Optimization
- **Minified libraries**: lucide and xlsx are pre-minified
- **Cache strategy**: Excel data cached for 5 minutes
- **HTTP requests**: Minimal for GitHub Pages (4-5 total)
- **CSS**: Tailwind CDN used (development) or can be built locally

### Code Organization Trade-offs
- **Pro**: Logical folder structure improves maintainability
- **Con**: Single file (script.js ~800 lines) might benefit from modularization
- **Decision**: Kept monolithic to avoid HTTP overhead on GitHub Pages

## 🔐 Security Notes

- **XSS Prevention**: DOM creation methods used instead of innerHTML
- **Form Submission**: Google Forms integration for user feedback
- **Data Storage**: No sensitive data stored locally
- **CSV/Excel**: Handled safely via XLSX library

---

**Last Updated**: 2026 
**Framework**: Vanilla JavaScript + Tailwind CSS  
**Deployment**: GitHub Pages  
**License**: MIT

© 2026 Ban Truyền Thông Chánh Tâm