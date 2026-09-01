(() => {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("lc-theme");
    const setTheme = (theme) => {
        const isLight = theme === "light";
        document.body.dataset.theme = theme;
        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.innerHTML = isLight ? '<span>Dark Mode</span>' : '<span>Light Mode</span>';
    };
    setTheme(savedTheme === "light" ? "light" : "dark");
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("lc-theme", nextTheme);
    });

    const grid = document.getElementById("developerGrid");
    const loading = document.getElementById("loading");
    const emptyState = document.getElementById("emptyState");
    const modal = document.getElementById("profileModal");
    let developers = [];

    function setupCursor() {
        const cursor = document.querySelector(".custom-cursor");
        const ring = document.querySelector(".custom-cursor-ring");
        if (!cursor || !ring || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        document.addEventListener("mousemove", (event) => {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
            ring.style.left = `${event.clientX}px`;
            ring.style.top = `${event.clientY}px`;
        });
        document.addEventListener("mouseover", (event) => {
            const active = event.target.closest("a, button, .trainee-card");
            cursor.classList.toggle("hover", Boolean(active));
            ring.classList.toggle("hover", Boolean(active));
        });
    }

    function getProjectList(developer) {
        if (Array.isArray(developer.projects) && developer.projects.length) return developer.projects;
        return ["LC Studio Rebuild", "Project Delivery", "Collaborative Build"];
    }

    function render(items) {
        loading.style.display = "none";
        emptyState.hidden = items.length !== 0;
        grid.innerHTML = items.map((developer) => {
            const projects = getProjectList(developer).slice(0, 3);
            return `
                <article class="trainee-card" data-id="${developer.id}">
                    <div class="card-image">
                        <img class="card-portrait card-portrait-grid" src="${developer.image}" alt="Illustrated portrait of ${developer.first} ${developer.last}">
                        <img class="card-portrait card-portrait-hover" src="${developer.profileImage || developer.image}" alt="Photo of ${developer.first} ${developer.last}">
                    </div>
                    <div class="card-details">
                        <h2 class="card-name">${developer.first}<br>${developer.last}</h2>
                        <span class="trainee-role">${developer.role}</span>
                        <span class="developer-card-description">${developer.contribution}</span>
                        <div class="developer-projects" aria-label="Projects worked on by ${developer.first} ${developer.last}">
                            <span class="developer-projects-label">Projects</span>
                            <ul class="developer-project-list">
                                ${projects.map((project) => `<li>${project}</li>`).join("")}
                            </ul>
                        </div>
                        <button class="view-profile-btn" data-id="${developer.id}">View Profile <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function openProfile(id) {
        const developer = developers.find((item) => String(item.id) === String(id));
        if (!developer) return;
        const projects = getProjectList(developer);
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.getElementById("modalPortrait").src = developer.profileImage || developer.image;
        document.getElementById("modalPortrait").alt = `${developer.first} ${developer.last}`;
        document.getElementById("modalName").innerHTML = `${developer.first}<br><span>${developer.last}</span>`;
        document.getElementById("modalRole").textContent = developer.role;
        document.getElementById("modalCohort").textContent = developer.contribution;
        document.getElementById("modalProjects").innerHTML = projects.map((project) => `<li>${project}</li>`).join("");
        document.getElementById("linkedinLink").href = developer.linkedin;
        document.getElementById("githubLink").href = developer.github;
        document.getElementById("portfolioLink").href = developer.portfolio;
        document.getElementById("modalDownload").onclick = () => {
            if (developer.cv && developer.cv !== "#") window.open(developer.cv, "_blank", "noopener");
            else alert("CV not available yet.");
        };
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeProfile() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    grid.addEventListener("click", (event) => {
        const button = event.target.closest(".view-profile-btn");
        if (button) openProfile(button.dataset.id);
    });
    document.getElementById("modalClose").addEventListener("click", closeProfile);
    modal.addEventListener("click", (event) => { if (event.target === modal) closeProfile(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeProfile(); });

    async function loadDevelopers() {
        try {
            const response = await fetch("/backend/index.php?route=developers-public");
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || "Could not load developers");
            developers = data.developers || [];
            render(developers);
        } catch (error) {
            loading.style.display = "none";
            emptyState.hidden = false;
            emptyState.textContent = "Developers are temporarily unavailable.";
        }
    }

    setupCursor();
    loadDevelopers();
})();
