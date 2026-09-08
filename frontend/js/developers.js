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
    const selectedWorkButton = document.getElementById("selectedWorkButton");
    const projectsDrawer = document.getElementById("projectsDrawer");
    const projectsDrawerClose = document.getElementById("projectsDrawerClose");
    const projectsDrawerList = document.getElementById("projectsDrawerList");
    let developers = [];
    const developerAvatars = window.developerAvatars || {};

    const avatarFor = (developer) => {
        const firstName = String(developer.first || "").trim().toLowerCase();
        return developerAvatars[firstName] || "";
    };
    const profileFor = (developer) => developer.profileImage || developer.image || avatarFor(developer);

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
        const firstName = String(developer.first || "").trim().toLowerCase();
        const projects = ["LC STUDIO REBUILD"];
        if (firstName === "nina" || firstName === "phoenix") {
            projects.push("LIFE CHOICES CHRONICLE BLOG");
        }
        return projects;
    }

    function projectUrl(developer, project) {
        const firstName = String(developer.first || "").trim().toLowerCase();
        if (project === "LC STUDIO REBUILD") return "https://lcstudiorebuild.lcstudio.co.za";
        if ((firstName === "nina" || firstName === "phoenix") && project === "LIFE CHOICES CHRONICLE BLOG") {
            return "https://chronicle.lifechoices.co.za";
        }
        return "";
    }

    function projectDetails(developer, project) {
        const firstName = String(developer.first || "").trim().toLowerCase();
        const details = {
            mische: {
                "LC STUDIO REBUILD": {
                    description: "Mische helped shape the structure and visual rhythm of the trainee profile experience, turning the shared idea into a clear working interface.",
                    focus: ["Interface structure", "Visual direction", "Team delivery"]
                }
            },
            nina: {
                "LC STUDIO REBUILD": {
                    description: "Nina contributed to the profile experience with a focus on making the content feel approachable, organised, and useful to the people visiting it.",
                    focus: ["Content flow", "User experience", "Collaboration"]
                },
                "LIFE CHOICES CHRONICLE BLOG": {
                    description: "Nina helped develop the Chronicle experience as a place for Life Choices stories, ideas, and community work to be shared online.",
                    focus: ["Editorial design", "Content systems", "Digital storytelling"]
                }
            },
            phoenix: {
                "LC STUDIO REBUILD": {
                    description: "Phoenix contributed to the technical build of the profile experience, helping connect the interface, data, and responsive behaviour into one working site.",
                    focus: ["Web development", "Responsive UI", "Team delivery"]
                },
                "LIFE CHOICES CHRONICLE BLOG": {
                    description: "Phoenix helped build the Chronicle experience as a practical publishing space for Life Choices stories and community voices.",
                    focus: ["Frontend development", "Content systems", "Digital storytelling"]
                }
            },
            tylor: {
                "LC STUDIO REBUILD": {
                    description: "Tylor contributed to the shared LC Studio build, helping turn the team’s work and capabilities into a polished profile experience.",
                    focus: ["Frontend development", "Interaction design", "Team delivery"]
                }
            },
            zahraa: {
                "LC STUDIO REBUILD": {
                    description: "Zahraa helped refine the LC Studio profile experience so the team’s work could be presented clearly across different screens and contexts.",
                    focus: ["Visual design", "Responsive UI", "Collaboration"]
                }
            }
        };
        const fallback = {
            description: "A project contributed to by the LC Studio team through research, design, development, and delivery.",
            focus: ["Collaboration", "Problem solving", "Delivery"]
        };
        return {
            name: project,
            url: projectUrl(developer, project),
            ...(details[firstName]?.[project] || fallback)
        };
    }

    function projectContent(developer, project) {
        const details = projectDetails(developer, project);
        return details.url
            ? `<a href="${details.url}" target="_blank" rel="noopener">${details.name}</a>`
            : details.name;
    }

    function projectLink(details) {
        return details.url
            ? `<a class="project-link" href="${details.url}" target="_blank" rel="noopener" aria-label="Open ${details.name}"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
            : "";
    }

    function projectAccordion(developer, project, index) {
        const details = projectDetails(developer, project);
        return `
            <li class="project-accordion-item">
                <button class="project-accordion-trigger" type="button" aria-expanded="${index === 0}" aria-controls="project-panel-${index}">
                    <span class="project-number">0${index + 1}</span>
                    <span>${details.name}</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="project-accordion-panel" id="project-panel-${index}" ${index === 0 ? "" : "hidden"}>
                    <div class="project-focus">${details.focus.map((focus) => `<span>${focus}</span>`).join("")}</div>
                    <p>${details.description}</p>
                    ${projectLink(details)}
                </div>
            </li>
        `;
    }

    function profileSummary(developer) {
        const name = `${developer.first} ${developer.last}`.trim();
        return `${name} is a ${developer.role || "developer"} contributing to the LC Studio Rebuild. Their work combines thoughtful collaboration, practical problem-solving, and a focus on creating clear, people-centred digital experiences.`;
    }

    function focusAreas(developer) {
        const role = String(developer.role || "").toLowerCase();
        if (role.includes("ui") || role.includes("design")) return ["UI/UX design", "Prototyping", "Design systems"];
        if (role.includes("backend")) return ["APIs", "Data systems", "Architecture"];
        if (role.includes("project")) return ["Team delivery", "Planning", "Collaboration"];
        if (role.includes("front")) return ["Interfaces", "JavaScript", "Responsive UI"];
        return ["Full-stack build", "Problem solving", "Collaboration"];
    }

    function render(items) {
        loading.style.display = "none";
        emptyState.hidden = items.length !== 0;
        grid.innerHTML = items.map((developer) => {
            const projects = getProjectList(developer).slice(0, 3);
            const blueImage = avatarFor(developer);
            const profileImage = profileFor(developer);
            return `
                <article class="trainee-card" data-id="${developer.id}">
                    <div class="card-image">
                        <img class="card-portrait card-portrait-grid" src="${blueImage}" alt="Illustrated portrait of ${developer.first} ${developer.last}">
                        <img class="card-portrait card-portrait-hover" src="${profileImage}" alt="Photo of ${developer.first} ${developer.last}">
                    </div>
                    <div class="card-details">
                        <h2 class="card-name">${developer.first}<br>${developer.last}</h2>
                        <span class="trainee-role">${developer.role}</span>
                        <span class="developer-card-description">${developer.contribution}</span>
                        <div class="developer-projects" aria-label="Projects worked on by ${developer.first} ${developer.last}">
                            <span class="developer-projects-label">Projects</span>
                            <ul class="developer-project-list">
                                ${projects.map((project) => `<li>${projectContent(developer, project)}</li>`).join("")}
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
        const modalPortrait = document.getElementById("modalPortrait");
        modalPortrait.onerror = () => {
            // Uploaded photos may be absent locally; retain a complete card by
            // falling back to the developer's supplied illustration.
            modalPortrait.onerror = null;
            modalPortrait.src = avatarFor(developer);
        };
        modalPortrait.src = profileFor(developer);
        modalPortrait.alt = `${developer.first} ${developer.last}`;
        document.getElementById("modalName").innerHTML = `${developer.first}<br><span>${developer.last}</span>`;
        document.getElementById("modalRole").textContent = developer.role;
        document.getElementById("modalCohort").textContent = developer.contribution;
        document.getElementById("modalAbout").textContent = profileSummary(developer);
        document.getElementById("modalProjects").innerHTML = projects.slice(0, 3).map((project, index) => `<li><button class="modal-project-trigger" type="button" data-project-index="${index}"><span class="project-number">0${index + 1}</span><span>${projectContent(developer, project)}</span><i class="fa-solid fa-arrow-right"></i></button></li>`).join("");
        projectsDrawerList.innerHTML = projects.map((project, index) => projectAccordion(developer, project, index)).join("");
        document.getElementById("modalSkills").innerHTML = focusAreas(developer).map((skill) => `<span>${skill}</span>`).join("");
        document.getElementById("linkedinLink").href = developer.linkedin;
        document.getElementById("githubLink").href = developer.github;
        document.getElementById("portfolioLink").href = developer.portfolio;
        document.getElementById("modalDownload").onclick = () => {
            if (developer.cv && developer.cv !== "#") window.open(developer.cv, "_blank", "noopener");
            else alert("CV not available yet.");
        };
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        closeProjectsDrawer();
    }

    function closeProfile() {
        closeProjectsDrawer();
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
    }

    function openProjectsDrawer(projectIndex = null) {
        projectsDrawer.setAttribute("aria-hidden", "false");
        selectedWorkButton.setAttribute("aria-expanded", "true");
        if (projectIndex !== null) {
            const trigger = projectsDrawerList.querySelectorAll(".project-accordion-trigger")[projectIndex];
            if (trigger) toggleProject(trigger, true);
        }
    }

    function toggleProject(trigger, forceOpen = null) {
        const panel = document.getElementById(trigger.getAttribute("aria-controls"));
        const shouldOpen = forceOpen === null ? trigger.getAttribute("aria-expanded") !== "true" : forceOpen;
        trigger.setAttribute("aria-expanded", String(shouldOpen));
        panel.hidden = !shouldOpen;
    }

    function closeProjectsDrawer() {
        projectsDrawer.setAttribute("aria-hidden", "true");
        selectedWorkButton.setAttribute("aria-expanded", "false");
    }

    grid.addEventListener("click", (event) => {
        const button = event.target.closest(".view-profile-btn");
        if (button) {
            openProfile(button.dataset.id);
            return;
        }
        if (event.target.closest("a, button")) return;
        const card = event.target.closest(".trainee-card");
        if (card) openProfile(card.dataset.id);
    });
    document.getElementById("modalProjects").addEventListener("click", (event) => {
        const trigger = event.target.closest(".modal-project-trigger");
        if (trigger) openProjectsDrawer(Number(trigger.dataset.projectIndex));
    });
    projectsDrawerList.addEventListener("click", (event) => {
        const trigger = event.target.closest(".project-accordion-trigger");
        if (trigger) toggleProject(trigger);
    });
    document.getElementById("modalClose").addEventListener("click", closeProfile);
    selectedWorkButton.addEventListener("click", openProjectsDrawer);
    projectsDrawerClose.addEventListener("click", closeProjectsDrawer);
    modal.addEventListener("click", (event) => { if (event.target === modal) closeProfile(); });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (projectsDrawer.getAttribute("aria-hidden") === "false") closeProjectsDrawer();
        else closeProfile();
    });

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
