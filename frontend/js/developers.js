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
            return ["LC STUDIO REBUILD", "LUMINA QUALITY ASSURANCE", "LIFE CHOICES CHRONICLE"];
        }
        if (firstName === "nina") {
            projects.push("LIFE CHOICES CHRONICLE BLOG");
        }
        projects.push("LUMINA QUALITY ASSURANCE");
        return projects;
    }

    function projectUrl(developer, project) {
        const firstName = String(developer.first || "").trim().toLowerCase();
        if (firstName === "phoenix" && project === "LC STUDIO REBUILD") return "https://lcstudiorebuild.lcstudio.co.za";
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
                    description: "For the LC Studio Rebuild, focused on the administrative side of the platform. This involved designing the admin interface, implementing secure authentication, and building the backend logic that allows other admins to be added, have their passwords issued, and manage user profiles directly -- reducing the need for constant developer intervention.",
                    focus: ["Admin authentication", "Backend management", "Profile management"],
                    subprojects: [
                        {
                            name: "ADMIN AUTHENTICATION & DESIGN",
                            description: ["Designed the admin interface and implemented secure authentication."]
                        },
                        {
                            name: "BACKEND ADMIN MANAGEMENT SYSTEM",
                            description: ["Built backend logic for adding admins, issuing passwords, and managing user profiles directly."]
                        },
                        {
                            name: "ADMIN-SIDE PROFILE MANAGEMENT",
                            description: ["Managed user profiles directly from the admin side of the platform."]
                        }
                    ]
                },
                "LUMINA QUALITY ASSURANCE": {
                    description: "For the Lumina project, thoroughly tested the admin side of the application in detail. When bugs were found, they were reported and documented clearly to support fixing issues and ensure a smooth, reliable experience for end-users.",
                    focus: ["Admin-side QA", "Bug catching", "Bug reporting"]
                }
            },
            nina: {
                "LC STUDIO REBUILD": {
                    description: "Contributed to the profile experience with a focus on making the content feel approachable, organised, and useful to the people visiting it.",
                    focus: ["Content flow", "User experience", "Collaboration"]
                },
                "LIFE CHOICES CHRONICLE BLOG": {
                    description: "Helped develop the Chronicle experience as a place for Life Choices stories, ideas, and community work to be shared online.",
                    focus: ["Editorial design", "Content systems", "Digital storytelling"]
                }
            },
            phoenix: {
                "LC STUDIO REBUILD": {
                    description: "Contributed to rebuilding the LC Studio website through design, development, animation, and database features across the website's design, helping shape its identity, interactive experience, and showcase of the Life Choices team.",
                    focus: ["Interactive Profiles", "Responsive Design", "Visual Storytelling", "User Experience", "Front-End Development"],
                    subprojects: [
                        {
                            name: "VISUAL DESIGN AND ILLUSTRATION",
                            description: [
                                "Created temporary avatars and illustrated developer portraits during the LC Studio website rebuild.",
                                "Developed the idea into an interactive feature that transitions portraits into real photographs."
                            ]
                        },
                        {
                            name: "HERO SECTION ANIMATION",
                            description: [
                                "Designed and animated the LC Studio website hero splash screen for WordPress.",
                                "Created a more engaging introduction while strengthening the site’s visual identity."
                            ]
                        },
                        {
                            name: "DEVELOPER PROFILES AND DATABASE INTEGRATION",
                            description: [
                                "Built the Developers/Profiles page with PHP and MySQL during the website rebuild.",
                                "Connected trainee data and improved responsive layouts across screen sizes."
                            ]
                        },
                        {
                            name: "UI/UX AND EXPERIENCE REFINEMENT",
                            description: [
                                "Tested different UI/UX approaches while rebuilding the LC Studio website.",
                                "Improved the presentation and interaction of profiles, imagery, and content."
                            ]
                        }
                    ]
                },
                "LUMINA QUALITY ASSURANCE": {
                    description: [
                        "Worked as a QA tester for Lumina, testing the Intern experience as one of the platform’s many user roles.",
                        "Checked user journeys, interactions, data accuracy, performance, and whether the platform was clear and easy to use.",
                        "Recorded bugs and collaborated on fixes, refinements, and improvements across the platform."
                    ],
                    focus: ["Cross-role validation", "Bug documentation", "Edge-case testing", "UX recommendations", "QA enablement"]
                },
                "LIFE CHOICES CHRONICLE": {
                    description: "Added onto the design and development of the Life Choices Chronicle, helping shape the overall visual experience across the site. Developed era-specific galleries, navigation between historical eras, and tailored page layouts, while maintaining consistency throughout the project. Worked closely with Nina to support the quality and presentation of Life Choices' 21st Anniversary project.",
                    focus: ["Interactive Experiences", "Visual Consistency", "Navigation", "Anniversary Project"]
                }
            },
            tylor: {
                "LC STUDIO REBUILD": {
                    description: "Contributed to the shared LC Studio build, helping turn the team’s work and capabilities into a polished profile experience.",
                    focus: ["Frontend development", "Interaction design", "Team delivery"],
                    subprojects: [
                        {
                            name: "WORDPRESS DEVELOPMENT",
                            description: [
                                "Implemented client logos with hover effects that showcase each company’s unique colours.",
                                "Designed the footer’s interactive credit with a subtle text highlight and clean brand initials."
                            ]
                        }
                    ]
                },
                "LUMINA QUALITY ASSURANCE": {
                    description: [
                        "Focused primarily on the Employer suite, with additional testing across Intern and Recruiter flows.",
                        "Worked with the team to identify performance delays and validate intern data across the platform.",
                        "Helped log issues that needed attention, removal, or refinement."
                    ],
                    focus: ["QA collaboration", "Bug documentation", "Employer testing", "Recruiter testing", "Cross-role validation"]
                }
            },
            zahraa: {
                "LC STUDIO REBUILD": {
                    description: "Helped shape the trainee profile experience in the LC Studio rebuild, mostly around the profile page, the profile model, and the front-end structure that pulled trainee information together in a cleaner way.",
                    focus: ["Trainee profile page", "Profile model", "Frontend structure", "Visual presentation"]
                },
                "LUMINA QUALITY ASSURANCE": {
                    description: "On Lumina, assisted with QA and testing the user journey by clicking through the app, checking how different interactions felt, and spotting the small things that could make the experience confusing. Additionally also contributed to help test whether the pages and user flows were easy to understand and use.",
                    focus: ["QA testing", "User interaction", "Bug spotting", "Experience checks"]
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

    function projectDescription(description) {
        const items = Array.isArray(description) ? description : [description];
        return `<ul class="project-description-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
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
                    ${projectDescription(details.description)}
                    ${subprojects.length ? `<div class="project-subprojects">${subprojects.map((subproject) => `<article class="project-subproject"><h3>${subproject.name}</h3><ul>${subproject.description.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div>` : ""}
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
