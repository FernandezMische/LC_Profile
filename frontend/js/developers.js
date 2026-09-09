(() => {
    const themeToggle = document.getElementById("themeToggle");
    const mobileThemeToggle = document.querySelector(".mobile-theme-toggle");
    const themeToggles = [themeToggle, mobileThemeToggle].filter(Boolean);
    const savedTheme = localStorage.getItem("lc-theme");
    const setTheme = (theme) => {
        const isLight = theme === "light";
        document.body.dataset.theme = theme;
        themeToggles.forEach((toggle) => {
            toggle.setAttribute("aria-pressed", String(isLight));
            toggle.innerHTML = isLight ? '<span>Dark Mode</span>' : '<span>Light Mode</span>';
        });
    };
    setTheme(savedTheme === "light" ? "light" : "dark");
    themeToggles.forEach((toggle) => toggle.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("lc-theme", nextTheme);
    }));

    const mobileMenuToggle = document.querySelector(".developer-mobile-menu-toggle");
    const mobileMenu = document.getElementById("developerMobileMenu");
    mobileMenuToggle?.addEventListener("click", () => {
        const isOpen = mobileMenu.getAttribute("aria-hidden") === "false";
        mobileMenu.setAttribute("aria-hidden", String(isOpen));
        mobileMenuToggle.setAttribute("aria-expanded", String(!isOpen));
        mobileMenuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-bars" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
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
        if (firstName === "phoenix") {
            return ["LC STUDIO", "LUMINA QUALITY ASSURANCE", "LIFE CHOICES CHRONICLE"];
        }
        if (firstName === "nina") {
            projects.push("LIFE CHOICES CHRONICLE BLOG");
        }
        projects.push("LUMINA QUALITY ASSURANCE");
        return projects;
    }

    function projectUrl(developer, project) {
        const firstName = String(developer.first || "").trim().toLowerCase();
        if (firstName === "phoenix" && project === "LC STUDIO") return "https://lcstudiorebuild.lcstudio.co.za";
        if (firstName === "phoenix" && project === "LUMINA QUALITY ASSURANCE") return "https://lumina.siriusdream.co.za";
        if (firstName === "phoenix" && project === "LIFE CHOICES CHRONICLE") return "https://chronicle.lifechoices.co.za";
        if (project === "LUMINA QUALITY ASSURANCE") return "https://lumina.siriusdream.co.za";
        if (project === "LC STUDIO REBUILD" || project === "WEBSITE ANIMATION" || project === "DEVELOPER PROFILES") {
            return "https://lcstudiorebuild.lcstudio.co.za";
        }
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
                "LC STUDIO": {
                    description: "Contributed to LC Studio’s design, development, animation, and database features across WordPress, PHP, MySQL, UI/UX, and visual design, helping shape its identity, interactive experience, and showcase of the Life Choices team.",
                    focus: ["Interactive Profiles", "Responsive Design", "Visual Storytelling", "User Experience", "Front-End Development"],
                    subprojects: [
                        {
                            name: "VISUAL DESIGN AND ILLUSTRATION",
                            description: "Created temporary avatars and illustrated representations of the developers during the site's production phase, before trainee profiles were introduced. This concept later evolved into a permanent interactive feature, where illustrated portraits transition to real photographs when hovered over.",
                            focus: ["Illustration", "Interactive imagery", "Visual identity"]
                        },
                        {
                            name: "WORDPRESS DEVELOPMENT AND SITE REFINEMENT",
                            description: "Implemented ongoing visual and functional refinements across the LC Studio website, including typography, text and image colour corrections, layout adjustments, and general UI consistency.",
                            focus: ["WordPress", "UI refinement", "Brand consistency"]
                        },
                        {
                            name: "HERO SECTION ANIMATION",
                            description: "Designed and animated the LC Studio Hero Section splash screen, creating a more engaging introduction to the website and strengthening its visual identity.",
                            focus: ["Animation", "Motion design", "Visual storytelling"]
                        },
                        {
                            name: "DEVELOPER PROFILES AND DATABASE INTEGRATION",
                            description: "Designed the Developers/Profiles page and connected trainee information to the website using PHP and MySQL. Built dynamic profile functionality while refining font sizing, layouts, and responsive display behaviour for different screen sizes.",
                            focus: ["PHP", "MySQL", "Dynamic profiles", "Responsive design"]
                        },
                        {
                            name: "UI/UX AND EXPERIENCE REFINEMENT",
                            description: "Experimented with different design approaches and display behaviours to improve how profiles, imagery, and content are presented, balancing functionality with the overall visual direction of LC Studio.",
                            focus: ["UI/UX", "Interaction design", "User experience"]
                        }
                    ]
                },
                "LUMINA QUALITY ASSURANCE": {
                    description: "Contributed to the quality assurance and validation of Lumina, Sirius Dream’s end-to-end platform designed to build evidence-backed professional profiles through an intern’s development journey. Tested core functionality across user roles, documented bugs and edge cases, and provided UX-focused recommendations to strengthen the intern experience and profile system. Also helped create an environment where other trainees could independently apply QA documentation to a complex, real-world platform.",
                    focus: ["Cross-role validation", "Bug documentation", "Edge-case testing", "UX recommendations", "QA enablement"]
                },
                "LIFE CHOICES CHRONICLE": {
                    description: "Contributed to the design and development of the Life Choices Chronicle, helping shape the overall visual experience across the site. Developed era-specific galleries, navigation between historical eras, and tailored page layouts, while maintaining consistency throughout the project. Worked closely with Nina to support the quality and presentation of Life Choices' 21st Anniversary project.",
                    focus: ["Interactive Experiences", "Visual Consistency", "Navigation", "Anniversary Project"]
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
            roles: [],
            focus: ["Collaboration", "Problem solving", "Delivery"]
        };
        const placeholder = {
            description: "Lumina project details coming soon.",
            roles: [],
            focus: ["Details coming soon"]
        };
        const projectData = details[firstName]?.[project] || (project === "LUMINA QUALITY ASSURANCE" ? placeholder : fallback);
        return {
            name: project,
            url: projectUrl(developer, project),
            ...projectData,
            roles: projectData.roles || []
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
        const subprojects = details.subprojects || [];
        return `
            <li class="project-accordion-item">
                <button class="project-accordion-trigger" type="button" aria-expanded="false" aria-controls="project-panel-${index}">
                    <span>${details.name}</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <div class="project-accordion-panel" id="project-panel-${index}" hidden>
                    <div class="project-focus">${details.focus.map((focus) => `<span>${focus}</span>`).join("")}</div>
                    ${details.roles.length ? `<p class="project-roles"><strong>Key roles:</strong> ${details.roles.join(" · ")}</p>` : ""}
                    <p>${details.description}</p>
                    ${subprojects.length ? `<div class="project-subprojects">${subprojects.map((subproject) => `<article class="project-subproject"><h3>${subproject.name}</h3><div class="project-focus">${subproject.focus.map((focus) => `<span>${focus}</span>`).join("")}</div><p>${subproject.description}</p></article>`).join("")}</div>` : ""}
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
        projectsDrawerList.querySelectorAll(".project-accordion-trigger").forEach((trigger) => toggleProject(trigger, false));
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
