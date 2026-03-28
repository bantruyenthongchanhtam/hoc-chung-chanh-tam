/* =======================
     STATE / TRẠNG THÁI
     Stores all global variables for member filtering and pagination
     Lưu trữ tất cả các biến toàn cục cho lọc thành viên và phân trang
======================= */
let allYears = []; // All available years with data / Tất cả các năm khả dụng có dữ liệu
let currentYear = Constant.ALL; // Currently selected year / Năm hiện tại được chọn
let searchQuery = Constant.EMPTY; // Current search text / Văn bản tìm kiếm hiện tại
let groupFilter = Constant.ALL; // Current group filter / Bộ lọc nhóm hiện tại
let sortType = Constant.NONE; // Current sort option / Tùy chọn sắp xếp hiện tại
let itemsPerPage = Constant.ITEMS_PER_PAGE; // Items per page for pagination / Số mục trên mỗi trang
let currentPage = 1; // Current page number / Số trang hiện tại
let yearPageIndex = 0; // Current year tab page / Trang tab năm hiện tại

/* =======================
     DOM CACHE / LƯU TRỮ DOM
     Caches frequently accessed DOM elements for better performance
     Lưu trữ các phần tử DOM được truy cập thường xuyên để hiệu suất tốt hơn
======================= */
const DOM_CACHE = {
    // Search and filter elements / Các phần tử tìm kiếm và lọc
    searchInput: null,
    groupFilter: null,
    sortSelect: null,
    limitSelect: null,

    // Loader and grid elements / Các phần tử loader và lưới
    globalLoader: null,
    memberGrid: null,
    paginNumbers: null,
    paginInfo: null,

    // Year tabs elements / Các phần tử tab năm
    tabsContainer: null,
    prevYears: null,
    nextYears: null,

    // Music player elements / Các phần tử trình phát nhạc
    bgMusic: null,
    musicToggle: null,
    musicIcon: null,
    musicTooltip: null,
    volumeSlider: null,
    volumeValue: null,
    volumeControl: null,

    // Initialize all cached elements / Khởi tạo tất cả các phần tử được lưu trữ
    init() {
        this.searchInput = document.getElementById("search-input");
        this.groupFilter = document.getElementById("group-filter");
        this.sortSelect = document.getElementById("sort-select");
        this.limitSelect = document.getElementById("limit-select");
        this.globalLoader = document.getElementById("global-loader");
        this.memberGrid = document.getElementById("member-grid");
        this.paginNumbers = document.getElementById("pagination-numbers");
        this.paginInfo = document.getElementById("pagination-info");
        this.tabsContainer = document.getElementById("tabs-container");
        this.prevYears = document.getElementById("prev-years");
        this.nextYears = document.getElementById("next-years");
        this.bgMusic = document.getElementById("bg-music");
        this.musicToggle = document.getElementById("music-toggle");
        this.musicIcon = document.getElementById("music-icon");
        this.musicTooltip = document.getElementById("music-tooltip");
        this.volumeSlider = document.getElementById("volume-slider");
        this.volumeValue = document.getElementById("volume-value");
        this.volumeControl = document.getElementById("volume-control");
    }
};

/* =======================
     UTILITY HELPERS / TRỢ GIÚP TIỆN ÍCH
     Helper functions for performance and functionality
     Các hàm trợ giúp cho hiệu suất và chức năng
======================= */
// Debounce - Delays function execution to prevent excessive calls / Trì hoãn thực thi hàm để ngăn các lệnh gọi quá mức
function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Memoization cache for expensive calculations / Bộ nhớ cache cho các phép tính tốn kém
const memoCache = {
    filters: {},
    sorts: {},
    clear() {
        this.filters = {};
        this.sorts = {};
    }
};

// Remove Vietnamese diacritical marks for diacritic-insensitive search / Xóa dấu Tiếng Việt để tìm kiếm không phân biệt dấu
function removeDiacritics(text) {
    if (!text) return '';

    // Map of Vietnamese characters with diacritics to their base characters
    // Bản đồ các ký tự Tiếng Việt có dấu thành ký tự cơ sở
    const diacriticsMap = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    };

    return text.split('').map(char => diacriticsMap[char] || char).join('');
}

// Exact search with diacritic support - no fuzzy matching / Tìm kiếm chính xác với hỗ trợ dấu - không khớp mờ
function exactMatch(query, text) {
    if (!query) return true; // Empty query matches all / Truy vấn trống khớp tất cả

    // Normalize both strings to remove diacritics and convert to lowercase
    // Chuẩn hóa cả hai chuỗi để xóa dấu và chuyển đổi thành chữ thường
    const normalizedQuery = removeDiacritics(query).toLowerCase();
    const normalizedText = removeDiacritics(text).toLowerCase();

    // Exact includes - must be a continuous substring / Bao gồm chính xác - phải là chuỗi con liên tục
    return normalizedText.includes(normalizedQuery);
}

// Create clear button for search input / Tạo nút xóa cho đầu vào tìm kiếm
function createClearButton() {
    // Reuse existing clear button or create new one / Tái sử dụng nút xóa hiện có hoặc tạo nút mới
    let clearBtn = DOM_CACHE.searchInput.parentElement.querySelector('.clear-search-btn');

    if (!clearBtn) {
        clearBtn = document.createElement("button");
        clearBtn.className = "clear-search-btn absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 text-lg flex items-center justify-center";
        clearBtn.innerHTML = "✕";
        clearBtn.type = "button";
        clearBtn.onclick = (e) => {
            e.preventDefault();
            DOM_CACHE.searchInput.value = "";
            searchQuery = Constant.EMPTY;
            currentPage = 1;
            memoCache.clear();
            clearBtn.style.display = "none";
            debouncedSearch();
            DOM_CACHE.searchInput.focus();
        };
        DOM_CACHE.searchInput.parentElement.appendChild(clearBtn);
    }

    return clearBtn;
}

// Get sortable name from member object / Lấy tên có thể sắp xếp từ đối tượng thành viên
function getSortableName(member) {
    return (member.fullName || member.name || "").toLowerCase();
}

// Highlight search terms in text / Làm nổi bật các từ tìm kiếm trong văn bản
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>');
}

// Create pagination ellipsis element / Tạo phần tử dấu chấm lửng phân trang
function createEllipsis() {
    const dot = document.createElement("span");
    dot.innerText = "...";
    dot.className = "px-1 text-stone-400 text-xs";
    return dot;
}

/* =======================
     INITIALIZATION / KHỞI TẠO
     Loads all initial data and sets up event handlers
     Tải tất cả dữ liệu ban đầu và thiết lập trình xử lý sự kiện
======================= */
window.onload = async () => {
    DOM_CACHE.init(); // Initialize all cached DOM elements / Khởi tạo tất cả các phần tử DOM được lưu trữ

    await wrapWithLoader(async () => {
        // Load only years that have member data / Tải chỉ các năm có dữ liệu member
        allYears = await MemberService.getYearsWithData();
        renderYearTabs(); // Render year selection tabs / Hiển thị các tab chọn năm
        updateYearPageIndex(); // Update the current year page index / Cập nhật chỉ mục trang năm hiện tại
        updateDisplay(); // Display members based on current filters / Hiển thị thành viên dựa trên bộ lọc hiện tại
    });

    initLotusEffect(); // Initialize lotus animation effect / Khởi tạo hiệu ứng hoạt ảnh hoa sen
    initMusic(); // Initialize music player controls / Khởi tạo điều khiển trình phát nhạc
    initEvents(); // Setup all event listeners / Thiết lập tất cả các trình nghe sự kiện
    lucide.createIcons(); // Create all icons from lucide library / Tạo tất cả các biểu tượng từ thư viện lucide
    Toast.init(); // Initialize toast notifications / Khởi tạo thông báo toast
};

// Show loading spinner / Hiển thị độ xoay tải
const showLoader = () =>
    DOM_CACHE.globalLoader.classList.remove("fade-out");

// Hide loading spinner / Ẩn độ xoay tải
const hideLoader = () =>
    DOM_CACHE.globalLoader.classList.add("fade-out");

// Wrap function execution with loading animation / Bao bọc thực thi hàm bằng hoạt ảnh tải
const wrapWithLoader = async (fn) => {
    showLoader();
    await new Promise((r) => setTimeout(r, 400)); // Wait for fade-in animation / Chờ hoạt ảnh mờ dần
    await fn();
    hideLoader();
};

/* =======================
     EVENT LISTENERS / CÁC TRÌNH NGHE SỰ KIỆN
     Sets up all event handlers for user interactions
     Thiết lập tất cả các trình xử lý sự kiện để tương tác người dùng
======================= */
// Debounced search function to prevent excessive filtering / Hàm tìm kiếm được debounce để ngăn lọc quá mức
const debouncedSearch = debounce(() => {
    wrapWithLoader(() => {
        currentPage = 1; // Reset to first page / Đặt lại trang đầu tiên
        memoCache.clear(); // Clear cache on new search / Xóa bộ nhớ cache khi tìm kiếm mới
        updateDisplay();
    });
}, 300);

/* =======================
     EVENT LISTENERS / CÁC TRÌNH NGHE SỰ KIỆN
     Setup all user interaction handlers for search, filters, sorting, and year navigation
     Thiết lập tất cả các trình xử lý tương tác người dùng cho tìm kiếm, lọc, sắp xếp và điều hướng năm
======================= */
function initEvents() {
    // Search input listener with debouncing and clear button visibility control / Trình nghe nhập tìm kiếm với debouncing và điều khiển hiển thị nút xóa
    DOM_CACHE.searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim(); // Trim whitespace / Cắt bỏ khoảng trắng

        if (searchQuery) {
            // Show clear button when input has value / Hiển thị nút xóa khi input có giá trị
            const clearBtn = createClearButton();
            clearBtn.style.display = "block";
        } else {
            // Hide clear button when input is empty / Ẩn nút xóa khi input trống
            const clearBtn = DOM_CACHE.searchInput.parentElement.querySelector('.clear-search-btn');
            if (clearBtn) clearBtn.style.display = "none";
        }

        debouncedSearch();
    });

    // Group filter listener for changing member groups / Trình nghe bộ lọc nhóm để thay đổi nhóm thành viên
    DOM_CACHE.groupFilter.addEventListener("change", (e) => {
        wrapWithLoader(() => {
            groupFilter = e.target.value;
            currentPage = 1;
            memoCache.clear(); // Clear cache on filter change / Xóa bộ nhớ cache khi thay đổi bộ lọc
            updateDisplay();
        });
    });

    // Sort listener for changing sort order / Trình nghe sắp xếp để thay đổi thứ tự sắp xếp
    DOM_CACHE.sortSelect.addEventListener("change", (e) => {
        wrapWithLoader(() => {
            sortType = e.target.value;
            currentPage = 1; // Reset to first page when sorting / Đặt lại trang đầu tiên khi sắp xếp
            memoCache.clear(); // Clear cache on sort change / Xóa bộ nhớ cache khi thay đổi sắp xếp
            updateDisplay();
        });
    });

    // Items per page listener / Trình nghe số lượng mục trên mỗi trang
    DOM_CACHE.limitSelect.addEventListener("change", (e) => {
        wrapWithLoader(() => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1; // Reset to first page when changing page size / Đặt lại trang đầu tiên khi thay đổi kích thước trang
            updateDisplay();
        });
    });

    // Year navigation buttons / Các nút điều hướng năm
    DOM_CACHE.prevYears.addEventListener("click", () => {
        if (yearPageIndex > 0) {
            yearPageIndex--;
            renderYearTabs();
        }
    });

    DOM_CACHE.nextYears.addEventListener("click", () => {
        const limit = getLimit();
        if ((yearPageIndex + 1) * limit < allYears.length) {
            yearPageIndex++;
            renderYearTabs();
        }
    });
}

/* =======================
     MUSIC CONTROL LOGIC / LOGIC ĐIỀU KHIỂN NHẠC
     Manages audio playback and volume control with auto-hide UI
     Quản lý phát lại âm thanh và điều khiển âm lượng với giao diện tự động ẩn
======================= */
function initMusic() {
    const audio = DOM_CACHE.bgMusic;
    const btn = DOM_CACHE.musicToggle;
    const volumeSlider = DOM_CACHE.volumeSlider;
    const volumeValue = DOM_CACHE.volumeValue;
    const volumeControl = DOM_CACHE.volumeControl;

    let volumeTimeout;

    // Set initial volume to 50% / Đặt âm lượng ban đầu thành 50%
    audio.volume = 0.5;
    if (volumeSlider) volumeSlider.value = 50;
    if (volumeValue) volumeValue.textContent = "50%";

    // Play/pause button click handler / Trình xử lý nhấp nút phát/tạm dừng
    btn.onclick = () => {
        if (audio.paused) {
            audio.play();
            updateMusicUI(true);
            showVolumeControl();
        } else {
            audio.pause();
            updateMusicUI(false);
        }
    };

    // Show volume control when hovering music button / Hiển thị điều khiển âm lượng khi di chuột qua nút nhạc
    btn.onmouseenter = () => {
        if (!audio.paused) {
            showVolumeControl();
        }
    };

    // Volume slider input handler / Trình xử lý đầu vào thanh trượt âm lượng
    if (volumeSlider) {
        volumeSlider.oninput = (e) => {
            const volume = e.target.value / 100;
            audio.volume = volume;
            if (volumeValue) {
                volumeValue.textContent = `${e.target.value}%`;
            }

            // Reset auto-hide timeout when user changes volume / Đặt lại hết thời gian tự động ẩn khi người dùng thay đổi âm lượng
            clearTimeout(volumeTimeout);
            volumeTimeout = setTimeout(() => {
                hideVolumeControl();
            }, 2000);
        };

        // Clear timeout on mouse/touch interaction / Xóa hết thời gian khi tương tác chuột/chạm
        volumeSlider.onmousedown = () => {
            clearTimeout(volumeTimeout);
        };

        volumeSlider.ontouchstart = () => {
            clearTimeout(volumeTimeout);
        };
    }

    // Show volume control with fade-in animation / Hiển thị điều khiển âm lượng với hoạt ảnh mờ dần
    function showVolumeControl() {
        if (volumeControl && !audio.paused) {
            volumeControl.classList.remove("hidden");
            setTimeout(() => {
                volumeControl.style.opacity = "1";
                volumeControl.style.transform = "translateY(0)";
            }, 10);

            // Auto-hide after 2 seconds / Tự động ẩn sau 2 giây
            clearTimeout(volumeTimeout);
            volumeTimeout = setTimeout(() => {
                hideVolumeControl();
            }, 2000);
        }
    }

    // Hide volume control with fade-out animation / Ẩn điều khiển âm lượng với hoạt ảnh mờ dần
    function hideVolumeControl() {
        if (volumeControl && !audio.paused) {
            volumeControl.style.opacity = "0";
            volumeControl.style.transform = "translateY(-10px)";
            setTimeout(() => {
                volumeControl.classList.add("hidden");
            }, 300);
        }
    }
}

/* Update music button UI based on play state / Cập nhật giao diện nút nhạc dựa trên trạng thái phát */
function updateMusicUI(isPlaying) {
    const icon = DOM_CACHE.musicIcon;
    const tooltip = DOM_CACHE.musicTooltip;
    const volumeControl = DOM_CACHE.volumeControl;

    if (isPlaying) {
        // Update to playing state - add pulse animation and speaker icon / Cập nhật trạng thái phát - thêm hoạt ảnh xung và biểu tượng loa
        icon.classList.add("music-pulse");
        tooltip.textContent = "Tắt nhạc";

        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
        `;
    } else {
        // Update to paused state - remove animation and show muted icon / Cập nhật trạng thái tạm dừng - xóa hoạt ảnh và hiển thị biểu tượng tắt tiếng
        icon.classList.remove("music-pulse");
        tooltip.textContent = "Bật nhạc";

        // Reuse hideVolumeControl animation from initMusic / Tái sử dụng hoạt ảnh hideVolumeControl từ initMusic
        // Directly hide the volume control without waiting for initMusic function / Ẩn trực tiếp điều khiển âm lượng mà không cần chờ hàm initMusic
        if (volumeControl) {
            volumeControl.style.opacity = "0";
            volumeControl.style.transform = "translateY(-10px)";
            setTimeout(() => {
                volumeControl.classList.add("hidden");
            }, 300);
        }

        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
        `;
    }
}

/* =======================
     YEAR TABS / CÁC TAB NĂM
     Manages year selection and pagination for mobile/desktop
     Quản lý chọn năm và phân trang cho di động/máy tính để bàn
======================= */
// Get the number of visible tabs based on screen size / Nhận số lượng tab hiển thị dựa trên kích thước màn hình
function getLimit() {
    return window.innerWidth < 768
        ? Constant.TAB_LIMITS.MOBILE // Show fewer tabs on mobile / Hiển thị ít tab trên di động
        : Constant.TAB_LIMITS.DESKTOP; // Show more tabs on desktop / Hiển thị nhiều tab trên máy tính để bàn
}

// Calculate and update the current page of year tabs / Tính toán và cập nhật trang hiện tại của tab năm
function updateYearPageIndex() {
    const limit = getLimit();
    const index = allYears.indexOf(currentYear);
    yearPageIndex = Math.floor(index / limit); // Find which page the current year is on / Tìm trang hiện tại của năm hiện tại
}

// Render year tab buttons with pagination / Hiển thị các nút tab năm với phân trang
async function renderYearTabs() {
    const limit = getLimit();
    const start = yearPageIndex * limit;
    const visibleYears = allYears.slice(start, start + limit); // Get visible years for current page / Lấy các năm hiển thị cho trang hiện tại

    DOM_CACHE.tabsContainer.innerHTML = Constant.EMPTY;
    const fragment = document.createDocumentFragment(); // Use fragment for batch DOM insertion / Sử dụng fragment để insert batch DOM

    visibleYears.forEach((year) => {
        const btn = document.createElement("button");
        btn.innerText = year;
        btn.className = `tab-btn px-4 md:px-8 py-2 md:py-3 rounded-xl border-2 border-transparent font-bold text-sm md:text-base text-stone-600 transition-all ${year === currentYear ? "active" : "hover:text-orange-600" // Highlight active year / Đánh dấu năm hoạt động
            }`;
        btn.onclick = async () => {
            currentYear = year;
            currentPage = 1; // Reset pagination when changing year / Đặt lại phân trang khi thay đổi năm
            memoCache.clear(); // Clear cache for new year / Xóa bộ nhớ cache cho năm mới
            renderYearTabs();
            await wrapWithLoader(updateDisplay);
        };
        fragment.appendChild(btn);
    });

    DOM_CACHE.tabsContainer.appendChild(fragment);

    // Update previous/next button states / Cập nhật trạng thái nút trước/tiếp theo
    DOM_CACHE.prevYears.disabled = yearPageIndex === 0; // Disable if on first page / Tắt nếu trên trang đầu tiên
    DOM_CACHE.nextYears.disabled = start + limit >= allYears.length; // Disable if on last page / Tắt nếu trên trang cuối cùng
}

/* =======================
     MEMBER LIST & PAGINATION / DANH SÁCH THÀNH VIÊN & PHÂN TRANG
     Fetches, filters, sorts and displays member data with pagination
     Tìm nạp, lọc, sắp xếp và hiển thị dữ liệu thành viên với phân trang
======================= */
async function updateDisplay() {
    // Fetch members for current year / Lấy thành viên cho năm hiện tại
    let members = await MemberService.getMembersByYear(currentYear);

    // Update group filter options based on available groups / Cập nhật tùy chọn bộ lọc nhóm dựa trên các nhóm khả dụng
    updateGroupOptions(members);

    // Apply search and group filters / Áp dụng các bộ lọc tìm kiếm và nhóm
    members = applyFilters(members);
    // Apply sorting / Áp dụng sắp xếp
    members = applySort(members);

    // Show empty state if no members match / Hiển thị trạng thái trống nếu không có thành viên khớp
    if (!members.length) {
        DOM_CACHE.memberGrid.innerHTML = getEmptyTemplate();
        DOM_CACHE.paginNumbers.innerHTML = Constant.EMPTY;
        DOM_CACHE.paginInfo.innerHTML = Constant.EMPTY;
        return;
    }

    // Calculate pagination info / Tính toán thông tin phân trang
    const totalItems = members.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedItems = members.slice(startIdx, startIdx + itemsPerPage); // Get items for current page / Lấy mục cho trang hiện tại

    // Render member cards / Hiển thị thẻ thành viên
    DOM_CACHE.memberGrid.innerHTML = paginatedItems.map(renderMemberCard).join("");

    // Render pagination controls / Hiển thị các điều khiển phân trang
    renderPaginationUI(totalPages, totalItems, startIdx, paginatedItems.length);
}

// Update group filter options based on available groups / Cập nhật tùy chọn bộ lọc nhóm dựa trên các nhóm khả dụng
function updateGroupOptions(members) {
    const select = DOM_CACHE.groupFilter;
    const currentVal = select.value;

    // Extract unique groups from all members / Trích xuất các nhóm duy nhất từ tất cả thành viên
    const groups = [
        ...new Set(
            members.flatMap((m) =>
                m.group ? m.group.split(",").map((g) => g.trim()) : []
            )
        ),
    ];

    // Rebuild group options / Xây dựng lại các tùy chọn nhóm
    select.innerHTML = '<option value="all">Tất cả Nhóm</option>';
    groups.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        if (g === currentVal) opt.selected = true;
        select.appendChild(opt);
    });

    // Reset filter if previously selected group no longer exists / Đặt lại bộ lọc nếu nhóm đã chọn trước đó không còn tồn tại
    if (currentVal !== "all" && !groups.includes(currentVal)) {
        groupFilter = Constant.ALL;
        select.value = "all";
    }
}

/* =======================
    PAGINATION RENDERING / HIỂN THỊ PHÂN TRANG
    Renders pagination controls showing only 3 visible page numbers
    Hiển thị các điều khiển phân trang chỉ hiển thị 3 số trang
======================= */
function renderPaginationUI(totalPages, totalItems, startIdx, currentCount) {
    const container = DOM_CACHE.paginNumbers;
    const info = DOM_CACHE.paginInfo;
    container.innerHTML = "";

    // If only one page, show simple info text / Nếu chỉ có một trang, hiển thị văn bản thông tin đơn giản
    if (totalPages <= 1) {
        info.innerText = `Hiển thị tất cả ${totalItems} thành viên`;
        return;
    }

    // Add previous button / Thêm nút trước
    container.appendChild(
        createPageBtn("<", currentPage - 1, currentPage === 1)
    );

    // Calculate which page numbers to show / Tính toán số trang nào để hiển thị
    const maxVisible = 3; // Show maximum 3 page numbers / Hiển thị tối đa 3 số trang
    let startPage, endPage;

    if (totalPages <= maxVisible) {
        // Show all pages if total is less than max visible / Hiển thị tất cả trang nếu tổng ít hơn tối đa hiển thị
        startPage = 1;
        endPage = totalPages;
    } else {
        // Try to center current page / Cố gắng tập trung trang hiện tại
        startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        endPage = startPage + maxVisible - 1;
        // Adjust if exceeding total pages / Điều chỉnh nếu vượt quá tổng số trang
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = endPage - maxVisible + 1;
        }
    }

    // Show leading ellipsis if pages before startPage / Hiển thị dấu chấm lửng phía trước nếu có trang trước startPage
    if (startPage > 1) {
        const dot = document.createElement("span");
        dot.innerText = "...";
        dot.className = "px-1 text-stone-400 text-xs";
        container.appendChild(createEllipsis());
    }

    // Render page number buttons / Hiển thị các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageBtn(i, i, false, i === currentPage));
    }

    // Show trailing ellipsis if pages after endPage / Hiển thị dấu chấm lửng phía sau nếu có trang sau endPage
    if (endPage < totalPages) {
        container.appendChild(createEllipsis());
    }

    // Add next button / Thêm nút tiếp theo
    container.appendChild(
        createPageBtn(">", currentPage + 1, currentPage === totalPages)
    );

    // Show current range information / Hiển thị thông tin phạm vi hiện tại
    const endIdx = startIdx + currentCount;
    info.innerText = `Hiển thị ${startIdx + 1
        } - ${endIdx} trên tổng số ${totalItems} thành viên`;
}

// Create a pagination button element / Tạo phần tử nút phân trang
function createPageBtn(text, targetPage, disabled, active = false) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.className = `page-link w-10 h-10 rounded-lg border border-orange-200 flex items-center justify-center font-bold text-sm transition-all ${active ? "active" : "bg-white text-stone-600 hover:bg-orange-50"
        } ${disabled ? "disabled" : ""}`;

    // Add click handler if button is not disabled or active / Thêm trình xử lý nhấp nếu nút không bị tắt hoặc hoạt động
    if (!disabled && !active) {
        btn.onclick = () =>
            wrapWithLoader(() => {
                currentPage = targetPage;
                window.scrollTo({ top: 300, behavior: "smooth" }); // Smooth scroll to grid / Cuộn mượt đến lưới
                updateDisplay();
            });
    }
    return btn;
}

/* =======================
     SEARCH & FILTERING / TÌM KIẾM & LỌC
     Applies search, group filters and sorting with memoization cache
     Áp dụng tìm kiếm, bộ lọc nhóm và sắp xếp với bộ nhớ cache memoization
======================= */
// Filter members by search query and group with exact matching / Lọc thành viên theo truy vấn tìm kiếm và nhóm với khớp chính xác
function applyFilters(members) {
    // Use memoization for identical filter combinations / Sử dụng memoization cho các kết hợp bộ lọc giống hệt
    const cacheKey = `${searchQuery}|${groupFilter}`;
    if (memoCache.filters[cacheKey]) {
        return memoCache.filters[cacheKey];
    }

    const result = members.filter((item) => {
        // Use exact matching for precise search / Sử dụng khớp chính xác để tìm kiếm chính xác
        const matchesSearch = !searchQuery ||
            exactMatch(searchQuery, item.fullName) ||
            exactMatch(searchQuery, item.position) ||
            exactMatch(searchQuery, item.group) ||
            exactMatch(searchQuery, item.note);

        // Check if group matches filter / Kiểm tra xem nhóm có khớp với bộ lọc không
        const isAllGroup =
            groupFilter === Constant.ALL || groupFilter === "all";
        const matchesGroup =
            isAllGroup ||
            item.group.toLowerCase().includes(groupFilter.toLowerCase());

        return matchesSearch && matchesGroup; // Both conditions must be true / Cả hai điều kiện phải đúng
    });

    // Cache the result / Lưu kết quả vào bộ nhớ cache
    memoCache.filters[cacheKey] = result;
    return result;
}

/* =======================
     SORTING / SẮP XẾP
     Sort members by name with Vietnamese locale support and memoization cache
     Sắp xếp thành viên theo tên với hỗ trợ ngôn ngữ Việt và bộ nhớ cache memoization
======================= */
// Sort members by name based on sort type with memoization / Sắp xếp thành viên theo tên dựa trên loại sắp xếp với memoization
function applySort(members) {
    // Use memoization for sort operations / Sử dụng memoization cho các hoạt động sắp xếp
    const cacheKey = sortType;
    if (memoCache.sorts[cacheKey] && JSON.stringify(memoCache.sorts[cacheKey]) === JSON.stringify(members)) {
        return memoCache.sorts[cacheKey];
    }

    let result = members;

    if (sortType === Constant.NAME_ASC) {
        // Sort A-Z with Vietnamese locale using helper function / Sắp xếp A-Z với ngôn ngữ Việt sử dụng hàm trợ giúp
        result = [...members].sort((a, b) => {
            const nameA = getSortableName(a);
            const nameB = getSortableName(b);
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
        });
    } else if (sortType === Constant.NAME_DESC) {
        // Sort Z-A with Vietnamese locale using helper function / Sắp xếp Z-A với ngôn ngữ Việt sử dụng hàm trợ giúp
        result = [...members].sort((a, b) => {
            const nameA = getSortableName(a);
            const nameB = getSortableName(b);
            return nameB.localeCompare(nameA, 'vi', { sensitivity: 'base' });
        });
    }

    // Cache the result / Lưu kết quả vào bộ nhớ cache
    memoCache.sorts[cacheKey] = result;
    return result;
}

/* =======================
     UI RENDER HELPERS / CÁC TRỢ GIÚP HIỂN THỊ GIAO DIỆN
     Functions for rendering member cards and empty states
     Các hàm để hiển thị thẻ thành viên và trạng thái trống
======================= */
// Render a single member profile card with search highlighting / Hiển thị một thẻ hồ sơ thành viên duy nhất với làm nổi bật tìm kiếm
function renderMemberCard(m) {
    // Use default avatar if member has no image / Sử dụng avatar mặc định nếu thành viên không có hình ảnh
    const imageSrc =
        m.img && m.img.trim() !== "" ? m.img : Constant.DEFAULT_AVATAR;

    // Highlight search terms in member name / Làm nổi bật các thuật ngữ tìm kiếm trong tên thành viên
    const highlightedName = highlightText(m.fullName, searchQuery);
    const highlightedPosition = highlightText(m.position, searchQuery);

    return `
        <div class="profile-card fade-in">
            <div class="image-outer img-skeleton">
                <img src="${imageSrc}" loading="lazy" decoding="async" alt="${m.fullName}" class="profile-img opacity-0" width="150" height="150"
                onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('img-skeleton');">
            </div>
            <h2 class="text-lg font-bold text-stone-800 mb-1 text-center">${highlightedName}</h2>
            <p class="text-[10px] text-stone-500 mb-2 text-center">${highlightedPosition}</p>
            <span class="bg-tag px-2 py-0.5 rounded-full text-[10px] font-bold text-center">
                ${m.group}
            </span>
            <p class="text-stone-500 text-xs italic mt-2 text-center">
                "${m.note}"
            </p>
        </div>
    `;
}

// Render empty state when no members found / Hiển thị trạng thái trống khi không tìm thấy thành viên
function getEmptyTemplate() {
    return `
        <div class="col-span-full py-20 text-center text-stone-400 italic">
            Không tìm thấy thành viên nào phù hợp...
        </div>
    `;
}

/* =======================
     LOTUS BACKGROUND EFFECT / HIỆU ỨNG NỀN HOA SEN
     Animates lotus particles falling from top with random properties
     Hoạt ảnh các hạt hoa sen rơi từ trên xuống với các thuộc tính ngẫu nhiên
======================= */
// Pre-defined SVG template for lotus particles to avoid recreating / Mẫu SVG được xác định trước cho các hạt hoa sen để tránh tạo lại
const LOTUS_SVG = `<svg width="30" height="30" viewBox="0 0 100 100">
    <path d="M50 10C50 10 35 40 10 50
             C35 60 50 90 50 90
             C50 90 65 60 90 50
             C65 40 50 10 50 10Z"
          fill="#fdba74" opacity="0.6"/>
    <circle cx="50" cy="50" r="10"
            fill="#fb923c" opacity="0.4"/>
</svg>`;

// Initialize lotus animation effect - create particles on interval / Khởi tạo hiệu ứng hoạt ảnh hoa sen - tạo hạt theo khoảng thời gian
function initLotusEffect() {
    setInterval(createLotus, 1500); // Create new lotus every 1.5 seconds / Tạo hoa sen mới mỗi 1,5 giây
    // Pre-create some lotus particles on load / Tạo trước một số hạt hoa sen khi tải
    for (let i = 0; i < 5; i++) {
        setTimeout(createLotus, i * 500);
    }
}

// Create a single lotus particle with random properties / Tạo một hạt hoa sen duy nhất với các thuộc tính ngẫu nhiên
function createLotus() {
    const lotus = document.createElement("div");
    lotus.className = "lotus-particle";
    lotus.innerHTML = LOTUS_SVG; // Reuse pre-defined SVG / Tái sử dụng SVG được xác định trước

    // Random horizontal position / Vị trí ngang ngẫu nhiên
    lotus.style.left = Math.random() * 100 + "vw";

    // Random size between 20-40px / Kích thước ngẫu nhiên giữa 20-40px
    const size = Math.random() * 20 + 20;
    lotus.style.width = size + "px";

    // Random animation duration between 8-13 seconds / Thời lượng hoạt ảnh ngẫu nhiên từ 8-13 giây
    lotus.style.animationDuration = Math.random() * 5 + 8 + "s";

    // Add to page / Thêm vào trang
    document.body.appendChild(lotus);

    // Remove after animation completes / Xóa sau khi hoạt ảnh hoàn thành
    setTimeout(() => lotus.remove(), 10000);
}
