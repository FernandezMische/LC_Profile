(() => {

    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("lc-theme");

    const setTheme = (theme) => {

        const isLight = theme === "light";

        document.body.dataset.theme = theme;
        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.innerHTML = isLight
            ? '<i class="fa-solid fa-moon" aria-hidden="true"></i><span>Dark Mode</span>'
            : '<i class="fa-solid fa-sun" aria-hidden="true"></i><span>Light Mode</span>';

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

    const trainees = [
        {
            first: "Zahraa",
            last: "Thompson",
            role: "Software Development Intern",
            cohort: 17,
            status: "employed",
            image: "../../images/001.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:zahraa@email.com",
            cv: "#"
        },
        {
            first: "Sinaye",
            last: "Dlamini",
            role: "Frontend Dev Intern",
            cohort: 18,
            status: "freelance",
            image: "../../images/002.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:sinaye@email.com",
            cv: "#"
        },
        {
            first: "Nadia",
            last: "Patel",
            role: "UI/UX Design Intern",
            cohort: 16,
            status: "employed",
            image: "../../images/003.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:nadia@email.com",
            cv: "#"
        },
        {
            first: "Luthando",
            last: "Mgwaza",
            role: "Backend Dev Intern",
            cohort: 18,
            status: "freelance",
            image: "../../images/004.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:luthando@email.com",
            cv: "#"
        },
        {
            first: "Jordan",
            last: "Petersen",
            role: "Mobile Dev Intern",
            cohort: 17,
            status: "opportunities",
            image: "../../images/005.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:jordan@email.com",
            cv: "#"
        },
        {
            first: "Amina",
            last: "Karim",
            role: "Data Analytics Intern",
            cohort: 16,
            status: "employed",
            image: "../../images/006.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:amina@email.com",
            cv: "#"
        },
        {
            first: "Luke",
            last: "Fraser",
            role: "DevOps Intern",
            cohort: 18,
            status: "opportunities",
            image: "../../images/007.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:luke@email.com",
            cv: "#"
        },
        {
            first: "Thando",
            last: "Nkoala",
            role: "Content & Brand Intern",
            cohort: 17,
            status: "employed",
            image: "../../images/008.png",
            linkedin: "#",
            github: "#",
            portfolio: "#",
            email: "mailto:thando@email.com",
            cv: "#"
        }
    ];


    const grid = document.getElementById("traineeGrid");
    const search = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
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

        grid.innerHTML = items.map((t) => `

        <article class="trainee-card" data-name="${t.first} ${t.last}">

            <div
                class="card-image"
                style="background-image:url('${t.image}')">
            </div>

            <div class="card-details">

                <h2 class="card-name">
                    ${t.first}<br>${t.last}
                </h2>

                <span class="trainee-role">
                    ${t.role}
                </span>

                <span class="cohort">
                    COHORT ${t.cohort}
                </span>

                <button
                    class="view-profile-btn"
                    data-name="${t.first} ${t.last}">

                    View Profile

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </article>

        `).join("");

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

        const status = statusFilter.value;

        if (status !== "all") {

            filtered = filtered.filter(
                (t) => t.status === status
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

    function openProfile(name) {

        const trainee = trainees.find(
            t => `${t.first} ${t.last}` === name
        );

        if (!trainee) return;

        document.getElementById("modalVisual").style.backgroundImage =
            `url('${trainee.image}')`;

        document.getElementById("modalName").innerHTML =
            `${trainee.first}<br><span>${trainee.last}</span>`;

        document.getElementById("modalRole").textContent =
            trainee.role;

        document.getElementById("modalCohort").textContent =
            `COHORT ${trainee.cohort}`;

        const selectedStatus = trainee.status === "available"
            ? "freelance"
            : trainee.status;

        document.querySelectorAll(".modal-statuses [data-status]").forEach((status) => {

            status.classList.toggle(
                "is-active",
                status.dataset.status === selectedStatus
            );

        });

        document.getElementById("linkedinLink").href =
            trainee.linkedin;

        document.getElementById("githubLink").href =
            trainee.github;

        document.getElementById("portfolioLink").href =
            trainee.portfolio;

        document.getElementById("emailLink").href =
            trainee.email;

        document.getElementById("modalDownload").onclick = () => {

            if (trainee.cv !== "#") {

                window.open(trainee.cv);

            } else {

                alert("CV not available yet.");

            }

        };

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

    }

    function closeProfile() {

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

    }

    grid.addEventListener("click", (e) => {

        const button = e.target.closest(".view-profile-btn");

        if (!button) return;

        openProfile(button.dataset.name);

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

    statusFilter.addEventListener("change", updateGrid);

    sortSelect.addEventListener("change", updateGrid);

    setTimeout(() => {

        updateGrid();

    }, 300);

})();
