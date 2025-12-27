/* =======================
    STATE
======================= */
let allYears = MemberService.getAllYears();
let currentYear = new Date().getFullYear();
let searchQuery = Constant.EMPTY;
let groupFilter = Constant.ALL;
let sortType = Constant.NONE;
let itemsPerPage = Constant.ITEMS_PER_PAGE;
let currentPage = 1;
let yearPageIndex = 0;

/* =======================
    INITIALIZATION
======================= */
window.onload = async () => {
    await wrapWithLoader(async () => {
        renderYearTabs();
    });

    initLotusEffect();
    initMusic();
    initEvents();
    lucide.createIcons();
    Toast.init()
};

// Modal Functions
function openModal() {
    document.getElementById("formModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("formModal").classList.remove("active");
    document.body.style.overflow = "auto";
}

function submitForm(event) {
    event.preventDefault();

    const message = document.getElementById("messageInput").value.trim();
    if (!message) {
        Toast.error(Constant.MESSAGE.ERROR.MSG_001, Constant.EMPTY);
        return;
    }

    const entryId = Constant.CONFIG.GOOGLE_FORM.ENTRY_ID;
    const formId = Constant.CONFIG.GOOGLE_FORM.FORM_ID;

    const submitUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = submitUrl;
    form.target = "hidden_iframe";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = entryId;
    input.value = message;

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
    document.body.removeChild(form);

    // UX
    document.getElementById("confessionForm").reset();
    closeModal();
    Toast.success(Constant.MESSAGE.SUCCESS.MSG_001, Constant.EMPTY);
}

const showLoader = () =>
    document.getElementById("global-loader").classList.remove("fade-out");
const hideLoader = () =>
    document.getElementById("global-loader").classList.add("fade-out");

const wrapWithLoader = async (fn) => {
    showLoader();
    await new Promise((r) => setTimeout(r, 400));
    await fn();
    hideLoader();
};

const Toast = {
    init() {
        this.container = document.getElementById('toast-container');
    },

    show(type, title, message, duration = 4000) {
        if (!this.container) this.init();

        // Chọn icon dựa trên loại thông báo
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        // Tạo element toast
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.style.setProperty('--duration', `${duration}ms`);
        
        toast.innerHTML = `
            <div class="flex-shrink-0">
                <i data-lucide="${icons[type]}" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-stone-900 text-sm">${title}</h4>
                <p class="text-stone-500 text-xs mt-0.5">${message}</p>
            </div>
            <button class="text-stone-300 hover:text-stone-500 transition-colors" onclick="this.parentElement.remove()">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        // Thêm vào container và khởi tạo icon
        this.container.appendChild(toast);
        lucide.createIcons();

        // Hiệu ứng trượt vào
        setTimeout(() => toast.classList.add('show'), 10);

        // Tự động xóa sau thời gian chỉ định
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    },

    // FUNCTION
    success(title, msg) { this.show('success', title, msg); },
    error(title, msg) { this.show('error', title, msg); },
    warning(title, msg) { this.show('warning', title, msg); },
    info(title, msg) { this.show('info', title, msg); }
};

/* =======================
    EVENT LISTENERS
======================= */
function initEvents() {
    document.getElementById("search-input").addEventListener("input", (e) => {
        wrapWithLoader(() => {
            searchQuery = e.target.value;
            currentPage = 1;
            updateDisplay();
        });
    });

    document.getElementById("group-filter").addEventListener("change", (e) => {
        wrapWithLoader(() => {
            groupFilter = e.target.value;
            currentPage = 1;
            updateDisplay();
        });
    });

    document.getElementById("sort-select").addEventListener("change", (e) => {
        wrapWithLoader(() => {
            sortType = e.target.value;
            updateDisplay();
        });
    });

    document.getElementById("limit-select").addEventListener("change", (e) => {
        wrapWithLoader(() => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            updateDisplay();
        });
    });
}

/* =======================
    MUSIC CONTROL LOGIC
======================= */
function initMusic() {
    const audio = document.getElementById("bg-music");
    const btn = document.getElementById("music-toggle");

    btn.onclick = () => {
        if (audio.paused) {
            audio.play();
            updateMusicUI(true);
        } else {
            audio.pause();
            updateMusicUI(false);
        }
    };
}

/* Update music button UI based on play state */
function updateMusicUI(isPlaying) {
    const icon = document.getElementById("music-icon");
    const tooltip = document.getElementById("music-tooltip");

    if (isPlaying) {
        icon.classList.add("music-pulse");
        tooltip.textContent = "Tắt nhạc";
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
        `;
    } else {
        icon.classList.remove("music-pulse");
        tooltip.textContent = "Bật nhạc";
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
        `;
    }
}

/* =======================
    RENDER YEAR TABS
======================= */
function getLimit() {
    return window.innerWidth < 768
        ? Constant.TAB_LIMITS.MOBILE
        : Constant.TAB_LIMITS.DESKTOP;
}

function updateYearPageIndex() {
    const limit = getLimit();
    const index = allYears.indexOf(currentYear);
    yearPageIndex = Math.floor(index / limit);
}

async function renderYearTabs() {
    const container = document.getElementById("tabs-container");
    const prevBtn = document.getElementById("prev-years");
    const nextBtn = document.getElementById("next-years");

    const limit = getLimit();
    const start = yearPageIndex * limit;
    const visibleYears = allYears.slice(start, start + limit);

    container.innerHTML = Constant.EMPTY;
    visibleYears.forEach((year) => {
        const btn = document.createElement("button");
        btn.innerText = year;
        btn.className = `tab-btn px-4 md:px-8 py-2 md:py-3 rounded-xl border-2 border-transparent font-bold text-sm md:text-base text-stone-600 transition-all ${
            year === currentYear ? "active" : "hover:text-orange-600"
        }`;
        btn.onclick = async () => {
            currentYear = year;
            currentPage = 1;
            renderYearTabs();
            await wrapWithLoader(updateDisplay);
        };
        container.appendChild(btn);
    });

    prevBtn.disabled = yearPageIndex === 0;
    nextBtn.disabled = start + limit >= allYears.length;

    prevBtn.onclick = () => {
        if (yearPageIndex > 0) {
            yearPageIndex--;
            renderYearTabs();
        }
    };

    nextBtn.onclick = () => {
        if ((yearPageIndex + 1) * limit < allYears.length) {
            yearPageIndex++;
            renderYearTabs();
        }
    };

    await updateDisplay();
}

window.onresize = () => {
    updateYearPageIndex();
    renderYearTabs();
};

/* =======================
    MEMBER LIST & PAGINATION
======================= */
async function updateDisplay() {
    const grid = document.getElementById("member-grid");
    const paginNumbers = document.getElementById("pagination-numbers");
    const paginInfo = document.getElementById("pagination-info");

    let members = await MemberService.getMembersByYear(currentYear);

    // Update group filter options based on current year
    updateGroupOptions(members);

    // Apply filters and sorting
    members = applyFilters(members);
    members = applySort(members);

    if (!members.length) {
        grid.innerHTML = getEmptyTemplate();
        paginNumbers.innerHTML = Constant.EMPTY;
        paginInfo.innerHTML = Constant.EMPTY;
        return;
    }

    // Pagination logic
    const totalItems = members.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedItems = members.slice(startIdx, startIdx + itemsPerPage);

    grid.innerHTML = paginatedItems.map(renderMemberCard).join("");

    // Render pagination UI
    renderPaginationUI(totalPages, totalItems, startIdx, paginatedItems.length);
}

/* =======================
    FILTER & SORT HELPERS
======================= */
function updateGroupOptions(members) {
    const select = document.getElementById("group-filter");
    const currentVal = select.value;
    const groups = [
        ...new Set(
            members.flatMap((m) =>
                m.group ? m.group.split(",").map((g) => g.trim()) : []
            )
        ),
    ];

    select.innerHTML = '<option value="all">Tất cả Nhóm</option>';
    groups.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        if (g === currentVal) opt.selected = true;
        select.appendChild(opt);
    });

    // Reset if the previous group no longer exists
    if (currentVal !== "all" && !groups.includes(currentVal)) {
        groupFilter = Constant.ALL;
        select.value = "all";
    }
}

/* =======================
   PAGINATION UPDATE: SHOW ONLY 3 PAGE NUMBERS
======================= */
function renderPaginationUI(totalPages, totalItems, startIdx, currentCount) {
    const container = document.getElementById("pagination-numbers");
    const info = document.getElementById("pagination-info");
    container.innerHTML = "";

    // If there is only one page, show all items info and stop
    if (totalPages <= 1) {
        info.innerText = `Hiển thị tất cả ${totalItems} thành viên`;
        return;
    }

    // "Previous" button
    container.appendChild(
        createPageBtn("<", currentPage - 1, currentPage === 1)
    );

    // Limit maximum visible page numbers to 3
    const maxVisible = 3;
    let startPage, endPage;

    if (totalPages <= maxVisible) {
        // If total pages are less than or equal to max visible
        startPage = 1;
        endPage = totalPages;
    } else {
        // Try to keep current page in the center
        startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        endPage = startPage + maxVisible - 1;
        // Adjust if exceeding total pages
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = endPage - maxVisible + 1;
        }
    }

    // Show leading "..." if pages before startPage exist
    if (startPage > 1) {
        const dot = document.createElement("span");
        dot.innerText = "...";
        dot.className = "px-1 text-stone-400 text-xs";
        container.appendChild(dot);
    }

    // Render page number buttons
    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageBtn(i, i, false, i === currentPage));
    }

    // Show trailing "..." if pages after endPage exist
    if (endPage < totalPages) {
        const dot = document.createElement("span");
        dot.innerText = "...";
        dot.className = "px-1 text-stone-400 text-xs";
        container.appendChild(dot);
    }

    // "Next" button
    container.appendChild(
        createPageBtn(">", currentPage + 1, currentPage === totalPages)
    );

    // Display current range information
    const endIdx = startIdx + currentCount;
    info.innerText = `Hiển thị ${
        startIdx + 1
    } - ${endIdx} trên tổng số ${totalItems} thành viên`;
}

function createPageBtn(text, targetPage, disabled, active = false) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.className = `page-link w-10 h-10 rounded-lg border border-orange-200 flex items-center justify-center font-bold text-sm transition-all ${
        active ? "active" : "bg-white text-stone-600 hover:bg-orange-50"
    } ${disabled ? "disabled" : ""}`;

    if (!disabled && !active) {
        btn.onclick = () =>
            wrapWithLoader(() => {
                currentPage = targetPage;
                window.scrollTo({ top: 300, behavior: "smooth" });
                updateDisplay();
            });
    }
    return btn;
}

function updateGroupOptions(members) {
    const select = document.getElementById("group-filter");
    const currentVal = select.value;
    const groups = [
        ...new Set(
            members.flatMap((m) =>
                m.group ? m.group.split(",").map((g) => g.trim()) : []
            )
        ),
    ];
    select.innerHTML = '<option value="all">Tất cả Nhóm</option>';
    groups.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        if (g === currentVal) opt.selected = true;
        select.appendChild(opt);
    });
}

function applyFilters(members) {
    return members.filter((item) => {
        const matchesSearch = item.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const isAllGroup =
            groupFilter === Constant.ALL || groupFilter === "all";
        const matchesGroup =
            isAllGroup ||
            item.group.toLowerCase().includes(groupFilter.toLowerCase());
        return matchesSearch && matchesGroup;
    });
}

function applySearch(members) {
    if (!searchQuery) return members;

    return members.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

function applySort(members) {
    if (sortType === Constant.NAME_ASC) {
        return [...members].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }

    if (sortType === Constant.NAME_DESC) {
        return [...members].sort((a, b) => b.name.localeCompare(a.name, "vi"));
    }

    return members;
}

/* =======================
    UI RENDER HELPERS
======================= */
function renderMemberCard(m) {
    const imageSrc =
        m.img && m.img.trim() !== "" ? m.img : Constant.DEFAULT_AVATAR;

    return `
        <div class="profile-card fade-in">
            <div class="image-outer img-skeleton">
                <img src="${imageSrc}" loading="lazy" alt="${m.fullName}" class="profile-img opacity-0" width="150" height="150"
                onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('img-skeleton');">
            </div>
            <h2 class="text-lg font-bold text-stone-800 mb-1 text-center">${m.fullName}</h2>
            <p class="text-[10px] text-stone-500 mb-2 text-center">${m.position}</p>
            <span class="bg-tag px-2 py-0.5 rounded-full text-[10px] font-bold text-center">
                ${m.group}
            </span>
            <p class="text-stone-500 text-xs italic mt-2 text-center">
                "${m.note}"
            </p>
        </div>
    `;
}

function getEmptyTemplate() {
    return `
        <div class="col-span-full py-20 text-center text-stone-400 italic">
            Không tìm thấy thành viên nào phù hợp...
        </div>
    `;
}

/* =======================
   EVENTS
======================= */
document.getElementById("search-input").addEventListener("input", async (e) => {
    searchQuery = e.target.value;
    await updateDisplay();
});

document.getElementById("sort-select").addEventListener("change", async (e) => {
    sortType = e.target.value;
    await updateDisplay();
});

/* =======================
    LOTUS BACKGROUND EFFECT
======================= */
function initLotusEffect() {
    setInterval(createLotus, 1500);
    for (let i = 0; i < 5; i++) {
        setTimeout(createLotus, i * 500);
    }
}

function createLotus() {
    const lotus = document.createElement("div");
    lotus.className = "lotus-particle";

    lotus.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 100 100">
            <path d="M50 10C50 10 35 40 10 50
                     C35 60 50 90 50 90
                     C50 90 65 60 90 50
                     C65 40 50 10 50 10Z"
                  fill="#fdba74" opacity="0.6"/>
            <circle cx="50" cy="50" r="10"
                    fill="#fb923c" opacity="0.4"/>
        </svg>
    `;

    lotus.style.left = Math.random() * 100 + "vw";
    const size = Math.random() * 20 + 20;
    lotus.style.width = size + "px";
    lotus.style.animationDuration = Math.random() * 5 + 8 + "s";

    document.body.appendChild(lotus);
    setTimeout(() => lotus.remove(), 10000);
}
