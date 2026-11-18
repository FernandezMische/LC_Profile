(() => {

    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("lc-theme");

    const setTheme = (theme) => {
        const isLight = theme === "light";
        document.body.dataset.theme = theme;
        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.innerHTML = isLight
            ? '<span>Dark Mode</span>'
            : '<span>Light Mode</span>';
    };

    setTheme(savedTheme === "light" ? "light" : "dark");

    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("lc-theme", nextTheme);
    });

    const cursor = document.querySelector(".custom-cursor");
    const cursorRing = document.querySelector(".custom-cursor-ring");
    const usesPointerCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (cursor && cursorRing && usesPointerCursor) {
        document.addEventListener("mousemove", (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
            cursorRing.style.left = `${e.clientX}px`;
            cursorRing.style.top = `${e.clientY}px`;
        });

        document.addEventListener("mouseover", (e) => {
            const interactive = e.target.closest("a, button, select, input, .trainee-card");
            cursor.classList.toggle("hover", Boolean(interactive));
            cursorRing.classList.toggle("hover", Boolean(interactive));
        });

        document.addEventListener("mouseleave", () => {
            cursor.style.opacity = "0";
            cursorRing.style.opacity = "0";
        });

        document.addEventListener("mouseenter", () => {
            cursor.style.opacity = "1";
            cursorRing.style.opacity = "1";
        });
    }

    let trainees = [];

    function imagesFor(trainee) {
        return {
            grid: trainee.image || "/images/001.png",
            profile: trainee.profileImage || trainee.image || "/images/001.png"
        };
    }

    function setProfileLink(id, url) {
        const link = document.getElementById(id);
        const href = typeof url === "string" ? url.trim() : "";
        const available = href !== "" && href !== "#";

        link.hidden = !available;
        if (available) {
            link.href = href;
        } else {
            link.removeAttribute("href");
        }

        return available;
    }

    const formatCohort = (value) => {
        const n = parseInt(value, 10);
        if (Number.isNaN(n) || n < 0) return "";
        return String(n).padStart(2, "0");
    };

    function getStatusBadges(statusString) {
        const statusMap = {
            'freelance': { label: 'Available to Freelance', class: 'status-freelance' },
            'opportunities': { label: 'Open to Opportunities', class: 'status-opportunities' },
            'employed': { label: 'Currently Employed', class: 'status-employed' }
        };

        let statuses = [];
        if (statusString) {
            statuses = String(statusString)
                .split(/[|,]/)
                .map(s => s.trim().toLowerCase())
                .filter(s => s && s !== 'unemployed' && statusMap[s]);
        }

        const badgesHtml = statuses.map(s => 
            `<span class="status-badge ${statusMap[s].class}">${statusMap[s].label}</span>`
        ).join('');

        return `<div class="card-statuses">${badgesHtml}</div>`;
    }

    const grid = document.getElementById("traineeGrid");
    const search = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const cohortFilter = document.getElementById("cohortFilter");
    const cohortFilterWrap = document.getElementById("cohortFilterWrap");
    const loading = document.getElementById("loading");
    const emptyState = document.getElementById("emptyState");
    const modal = document.getElementById("profileModal");

    document.querySelectorAll(".filter-select").forEach((filterSelect) => {
        const select = filterSelect.querySelector("select");
        const trigger = filterSelect.querySelector(".filter-select-trigger");
        const triggerLabel = trigger.querySelector("span");
        const menu = filterSelect.querySelector(".filter-select-menu");

        const close = () => {
            filterSelect.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
        };

        trigger.addEventListener("click", () => {
            const isOpen = filterSelect.classList.toggle("is-open");
            trigger.setAttribute("aria-expanded", String(isOpen));
        });

        menu.addEventListener("click", (event) => {
            const option = event.target.closest("[role='option']");
            if (option) {
                select.value = option.dataset.value;
                triggerLabel.textContent = option.textContent;
                menu.querySelectorAll("[role='option']").forEach((item) => {
                    item.setAttribute("aria-selected", String(item === option));
                });
                select.dispatchEvent(new Event("change"));
                close();
            }
        });

        document.addEventListener("click", (e) => {
            if (!filterSelect.contains(e.target)) close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });
    });

    function render(items) {
        if (!loading || !grid) return;
        
        loading.style.display = "none";

        if (items.length === 0) {
            grid.innerHTML = "";
            if (emptyState) emptyState.hidden = false;
            return;
        }

        if (emptyState) emptyState.hidden = true;

        grid.innerHTML = items.map((t) => {
            const images = imagesFor(t);

            return `
        <article class="trainee-card" data-id="${t.id}">
            <div class="card-image">
                <img class="card-portrait card-portrait-grid" src="${images.grid}" alt="Illustrated portrait of ${t.first} ${t.last}">
                <img class="card-portrait card-portrait-hover" src="${images.profile}" alt="Photo of ${t.first} ${t.last}">
            </div>

            <div class="card-details">
                <h2 class="card-name">${t.first}<br>${t.last}</h2>
                <span class="trainee-role">${t.role}</span>
                <span class="cohort">COHORT ${formatCohort(t.cohort)}</span>
                ${getStatusBadges(t.status)}
                <button class="view-profile-btn" data-id="${t.id}">
                    View Profile
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </article>`;
        }).join("");
    }

    function populateCohortFilter() {
        const selectedValue = cohortFilter.value;
        const cohortValues = [...new Set(trainees.map((trainee) => String(trainee.cohort)))]
            .filter((value) => /^\d+$/.test(value))
            .sort((a, b) => Number(a) - Number(b));
        const choices = [
            { value: "all", label: "All Cohorts" },
            ...cohortValues.map((cohort) => ({ value: cohort, label: `Cohort ${formatCohort(cohort)}` }))
        ];

        cohortFilter.replaceChildren(...choices.map(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            return option;
        }));
        const menu = cohortFilterWrap.querySelector(".filter-select-menu");
        menu.replaceChildren(...choices.map(({ value, label }) => {
            const option = document.createElement("button");
            option.type = "button";
            option.setAttribute("role", "option");
            option.dataset.value = value;
            option.textContent = label;
            option.setAttribute("aria-selected", String(value === selectedValue));
            return option;
        }));

        cohortFilter.value = choices.some((choice) => choice.value === selectedValue) ? selectedValue : "all";
        const label = cohortFilterWrap.querySelector(".filter-select-trigger span");
        label.textContent = choices.find((choice) => choice.value === cohortFilter.value).label;
        menu.querySelectorAll("[role='option']").forEach((option) => {
            option.setAttribute("aria-selected", String(option.dataset.value === cohortFilter.value));
        });
    }

    function updateGrid() {
        if (!search || !sortSelect) return;

        let filtered = [...trainees];
        const query = search.value.toLowerCase();

        if (query) {
            filtered = filtered.filter((t) =>
                `${t.first} ${t.last} ${t.role}`.toLowerCase().includes(query)
            );
        }
        if (sortSelect.value === "cohort" && cohortFilter.value !== "all") {
            filtered = filtered.filter((trainee) => String(trainee.cohort) === cohortFilter.value);
        }

        if (sortSelect.value === "name") {
            filtered.sort((a, b) => `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`));
        } else if (sortSelect.value === "cohort") {
            filtered.sort((a, b) => a.cohort - b.cohort);
        }

        render(filtered);
    }

    function openProfile(id) {
        const trainee = trainees.find(t => String(t.id) === String(id));
        if (!trainee) return;

        const scrollY = window.scrollY;
        document.body.dataset.scrollY = String(scrollY);
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY}px`;

        const modalPortrait = document.getElementById("modalPortrait");
        modalPortrait.src = imagesFor(trainee).profile;
        modalPortrait.alt = `${trainee.first} ${trainee.last}`;

        document.getElementById("modalName").innerHTML = `${trainee.first}<br><span>${trainee.last}</span>`;
        document.getElementById("modalRole").textContent = trainee.role;
        document.getElementById("modalCohort").textContent = `COHORT ${formatCohort(trainee.cohort)}`;
        setProfileLink("linkedinLink", trainee.linkedin);
        setProfileLink("githubLink", trainee.github);
        setProfileLink("portfolioLink", trainee.portfolio);

        const cvLink = typeof trainee.cv === "string" ? trainee.cv.trim() : "";
        const hasCv = cvLink !== "" && cvLink !== "#";
        const downloadButton = document.getElementById("modalDownload");
        downloadButton.hidden = !hasCv;
        downloadButton.onclick = hasCv ? () => window.open(cvLink) : null;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeProfile() {
        if (!modal.classList.contains("show")) return;
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
        delete document.body.dataset.scrollY;
        requestAnimationFrame(() => {
            const previousScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, scrollY);
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
        });
    }

    grid.addEventListener("click", (e) => {
        const button = e.target.closest(".view-profile-btn");
        if (!button) return;
        openProfile(button.dataset.id);
    });

    document.getElementById("modalClose").addEventListener("click", closeProfile);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeProfile();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeProfile();
    });

    search.addEventListener("input", updateGrid);
    sortSelect.addEventListener("change", () => {
        const isCohortSort = sortSelect.value === "cohort";
        cohortFilterWrap.hidden = !isCohortSort;
        if (!isCohortSort) {
            cohortFilter.value = "all";
            const menu = cohortFilterWrap.querySelector(".filter-select-menu");
            menu.querySelectorAll("[role='option']").forEach((option) => {
                option.setAttribute("aria-selected", String(option.dataset.value === "all"));
            });
            cohortFilterWrap.querySelector(".filter-select-trigger span").textContent = "All Cohorts";
        }
        updateGrid();
    });
    cohortFilter.addEventListener("change", updateGrid);

    async function loadTrainees() {
        try {
            const response = await fetch('/backend/index.php?route=trainees-public');
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Could not load trainees');
            trainees = data.trainees;
            populateCohortFilter();
            updateGrid();
        } catch (error) {
            grid.innerHTML = '';
            emptyState.hidden = false;
            emptyState.textContent = 'Trainees are temporarily unavailable.';
            loading.style.display = 'none';
        }
    }

    // Wait for DOM to be fully loaded before running, AVOIDINNG NULL RESULTS
    function init() {
        loadTrainees();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();