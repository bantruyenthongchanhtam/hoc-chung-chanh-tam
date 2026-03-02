/* =======================
    INITIALIZATION
======================= */
window.onload = async () => {
    // await wrapWithLoader(async () => {
    //     renderYearTabs();
    //     updateYearPageIndex();
    //     updateDisplay();
    // });

    initLotusEffect();
    initMusic();
    // initEvents();
    lucide.createIcons();
    Toast.init()
};

/* =======================
    MUSIC CONTROL LOGIC
======================= */
function initMusic() {
    const audio = document.getElementById("bg-music");
    const btn = document.getElementById("music-toggle");
    const volumeSlider = document.getElementById("volume-slider");
    const volumeValue = document.getElementById("volume-value");
    const volumeControl = document.getElementById("volume-control");
    
    let volumeTimeout;

    // Set initial volume
    audio.volume = 0.5; // 50% volume by default
    if (volumeSlider) volumeSlider.value = 50;
    if (volumeValue) volumeValue.textContent = "50%";

    // Play/Pause toggle
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

    // Hover show volume control
    btn.onmouseenter = () => {
        if (!audio.paused) {
            showVolumeControl();
        }
    };

    // Volume control
    if (volumeSlider) {
        volumeSlider.oninput = (e) => {
            const volume = e.target.value / 100;
            audio.volume = volume;
            if (volumeValue) {
                volumeValue.textContent = `${e.target.value}%`;
            }
            
            // Reset timeout when change slider
            clearTimeout(volumeTimeout);
            volumeTimeout = setTimeout(() => {
                hideVolumeControl();
            }, 2000); // Hide after 3s
        };
        
        // Clear timeout
        volumeSlider.onmousedown = () => {
            clearTimeout(volumeTimeout);
        };
        
        volumeSlider.ontouchstart = () => {
            clearTimeout(volumeTimeout);
        };
    }
    
    // Show volume control
    function showVolumeControl() {
        if (volumeControl && !audio.paused) {
            volumeControl.classList.remove("hidden");
            setTimeout(() => {
                volumeControl.style.opacity = "1";
                volumeControl.style.transform = "translateY(0)";
            }, 10);
            
            // Auto hide volume control after 2s
            clearTimeout(volumeTimeout);
            volumeTimeout = setTimeout(() => {
                hideVolumeControl();
            }, 2000);
        }
    }
    
    // Hide volume control
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

/* Update music button UI based on play state */
function updateMusicUI(isPlaying) {
    const icon = document.getElementById("music-icon");
    const tooltip = document.getElementById("music-tooltip");
    const volumeControl = document.getElementById("volume-control");

    if (isPlaying) {
        icon.classList.add("music-pulse");
        tooltip.textContent = "Tắt nhạc";
        
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
        `;
    } else {
        icon.classList.remove("music-pulse");
        tooltip.textContent = "Bật nhạc";
        
        // Hide volume control khi tắt nhạc
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
}

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