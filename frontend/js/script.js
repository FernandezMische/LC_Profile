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

    // Trainees are loaded exclusively from the database via the API.
    let trainees = [];

    function imagesFor(trainee) {
        return {
            grid: trainee.image || "/images/001.png",
            profile: trainee.profileImage || trainee.image || "/images/001.png"
        };
    }

    // Display a cohort under the "Cohort XX" ruling: pad single digits with a
    // leading zero (e.g. 1 -> "01", 17 -> "17").
    const formatCohort = (value) => {
        const n = parseInt(value, 10);
        if (Number.isNaN(n) || n < 0) return "";
        return String(n).padStart(2, "0");
    };

    // Helper function to generate MULTIPLE status badges
    function getStatusBadges(statusString) {
        const statusMap = {
            'freelance': { label: 'Available to Freelance', class: 'status-freelance' },
            'opportunities': { label: 'Open to Opportunities', class: 'status-opportunities' },
            'employed': { label: 'Currently Employed', class: 'status-employed' }
        };

        let statuses = [];
        if (statusString) {
            // Splits by comma OR pipe
            statuses = String(statusString)
                .split(/[|,]/)
                .map(s => s.trim().toLowerCase())
                .filter(s => statusMap[s]);
        }

        let badgesHtml = '';
        if (statuses.length === 0) {
            badgesHtml = '<span class="status-badge status-not-employed">Unemployed</span>';
        } else {
            // This maps over ALL selected statuses and creates a badge for each
            badgesHtml = statuses.map(s => 
                `<span class="status-badge ${statusMap[s].class}">${statusMap[s].label}</span>`
            ).join('');
        }

        return `<div class="card-statuses">${badgesHtml}</div>`;
    }

    const grid = document.getElementById("traineeGrid");
    const search = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");

    const loading = document.getElementById("loading");
    const emptyState = document.getElementById("emptyState");

    const modal = document.getElementById("profileModal");

    document.querySelectorAll(".filter-select").forEach((filterSelect) => {

        const select = filterSelect.querySelector("select");
        const trigger = filterSelect.querySelector(".filter-select-trigger");
        const triggerLabel = trigger.querySelector("span");
        const options = filterSelect.querySelectorAll("[role='option']");

        const close = () => {

            filterSelect.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");

        };

        trigger.addEventListener("click", () => {

            const isOpen = filterSelect.classList.toggle("is-open");
            trigger.setAttribute("aria-expanded", String(isOpen));

        });

        options.forEach((option) => {

            option.addEventListener("click", () => {

                select.value = option.dataset.value;
                triggerLabel.textContent = option.textContent;

                options.forEach((item) => {
                    item.setAttribute("aria-selected", String(item === option));
                });

                select.dispatchEvent(new Event("change"));
                close();

            });

        });

        document.addEventListener("click", (e) => {

            if (!filterSelect.contains(e.target)) close();

        });

        document.addEventListener("keydown", (e) => {

            if (e.key === "Escape") close();

        });

    });

    function render(items) {

        loading.style.display = "none";

        if (items.length === 0) {
            grid.innerHTML = "";
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;

        grid.innerHTML = items.map((t) => {
            const images = imagesFor(t);

            return `

        <article class="trainee-card" data-id="${t.id}">

            <div class="card-image">
                <img class="card-portrait card-portrait-grid" src="${images.grid}" alt="Illustrated portrait of ${t.first} ${t.last}">
                <img class="card-portrait card-portrait-hover" src="${images.profile}" alt="Photo of ${t.first} ${t.last}">
            </div>

            <div class="card-details">

                <h2 class="card-name">
                    ${t.first}<br>${t.last}
                </h2>

                <span class="trainee-role">
                    ${t.role}
                </span>

                <span class="cohort">
                    COHORT ${formatCohort(t.cohort)}
                </span>

                ${getStatusBadges(t.status)}

                <button
                    class="view-profile-btn"
                    data-id="${t.id}">

                    View Profile

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </article>

        `;
        }).join("");

    }

    function updateGrid() {

        let filtered = [...trainees];

        const query = search.value.toLowerCase();

        if (query) {

            filtered = filtered.filter((t) =>
                `${t.first} ${t.last} ${t.role}`
                    .toLowerCase()
                    .includes(query)
            );

        }

        switch (sortSelect.value) {

            case "name":

                filtered.sort((a, b) =>
                    `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`)
                );

                break;

            case "cohort":

                filtered.sort((a, b) => a.cohort - b.cohort);

                break;

            default:
                break;

        }

        render(filtered);

    }

    function openProfile(id) {

        const trainee = trainees.find(
            t => String(t.id) === String(id)
        );

        if (!trainee) return;

        // Save the position before fixing the body: fixing it resets window.scrollY
        // in some browsers, which previously caused the close action to return to 0.
        const scrollY = window.scrollY;
        document.body.dataset.scrollY = String(scrollY);

        // Lock page scroll completely - set on both html and body for cross-browser support
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY}px`;

        const modalPortrait = document.getElementById("modalPortrait");
        modalPortrait.src = imagesFor(trainee).profile;
        modalPortrait.alt = `${trainee.first} ${trainee.last}`;

        document.getElementById("modalName").innerHTML =
            `${trainee.first}<br><span>${trainee.last}</span>`;

        document.getElementById("modalRole").textContent =
            trainee.role;

        document.getElementById("modalCohort").textContent =
            `COHORT ${formatCohort(trainee.cohort)}`;

        document.getElementById("linkedinLink").href =
            trainee.linkedin;

        document.getElementById("githubLink").href =
            trainee.github;

        document.getElementById("portfolioLink").href =
            trainee.portfolio;

        document.getElementById("modalDownload").onclick = () => {

            if (trainee.cv && trainee.cv !== "#") {

                window.open(trainee.cv);

            } else {

                alert("CV not available yet.");

            }

        };

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

    }

    function closeProfile() {

        if (!modal.classList.contains("show")) return;

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        // Restore page scroll - unlock html and body, restore scroll position
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
        delete document.body.dataset.scrollY;
        // Wait until the body is back in normal document flow, then restore the
        // original position without the page-level smooth-scroll animation.
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

    document
        .getElementById("modalClose")
        .addEventListener("click", closeProfile);

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            closeProfile();

        }

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeProfile();

        }

    });

    search.addEventListener("input", updateGrid);

    sortSelect.addEventListener("change", updateGrid);

    async function loadTrainees() {
        try {
            const response = await fetch('/backend/index.php?route=trainees-public');
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Could not load trainees');
            trainees = data.trainees;
            updateGrid();
        } catch (error) {
            grid.innerHTML = '';
            emptyState.hidden = false;
            emptyState.textContent = 'Trainees are temporarily unavailable.';
            loading.style.display = 'none';
        }
    }

    loadTrainees();

})();