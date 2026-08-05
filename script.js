(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const scrollProgress = document.querySelector("[data-scroll-progress]");
  const heroVisual = document.querySelector("[data-hero-visual]");
  let lastScrollTop = window.scrollY;

  const setYear = () => {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  };

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "打开导航");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    header?.classList.remove("is-hidden");
  };

  const initMenu = () => {
    if (!menuButton || !mobileNav) return;

    menuButton.addEventListener("click", () => {
      const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(willOpen));
      menuButton.setAttribute("aria-label", willOpen ? "关闭导航" : "打开导航");
      mobileNav.classList.toggle("is-open", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
      header?.classList.remove("is-hidden");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  };

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;

    if (scrollProgress) {
      scrollProgress.style.transform = `scaleX(${progress})`;
    }
    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 30);
      const delta = scrollTop - lastScrollTop;
      const movingDown = delta > 5;
      const movingUp = delta < -5;
      if (scrollTop < 420 || movingUp || document.body.classList.contains("menu-open")) {
        header.classList.remove("is-hidden");
      } else if (movingDown) {
        header.classList.add("is-hidden");
      }
    }
    if (Math.abs(scrollTop - lastScrollTop) > 5) lastScrollTop = scrollTop;
  };

  const initReveal = () => {
    const nodes = [...document.querySelectorAll(".reveal")];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node, index) => {
      node.style.transitionDelay = `${Math.min((index % 5) * 55, 220)}ms`;
      observer.observe(node);
    });
  };

  const animateCounter = (node) => {
    const target = Number(node.dataset.count || 0);
    const decimals = Number(node.dataset.decimals || 0);
    const duration = reducedMotion ? 0 : 1300;
    const startedAt = performance.now();

    const frame = (now) => {
      const elapsed = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 4);
      node.textContent = (target * eased).toFixed(decimals);
      if (elapsed < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const initCounters = () => {
    const counters = [...document.querySelectorAll("[data-count]")];
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.7 },
    );

    counters.forEach((counter) => observer.observe(counter));
  };

  const replayClass = (node, className) => {
    if (!node || reducedMotion) return;
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
  };

  const createAutoCycle = (root, count, duration, getIndex, activate) => {
    if (!root || reducedMotion || count < 2 || !("IntersectionObserver" in window)) {
      return;
    }

    let timer = null;
    let inView = false;
    let interacting = false;

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (!inView || interacting || document.hidden) return;
      timer = window.setInterval(() => {
        activate((getIndex() + 1) % count);
      }, duration);
    };

    root.addEventListener("pointerenter", () => {
      interacting = true;
      stop();
    });
    root.addEventListener("pointerleave", () => {
      interacting = false;
      start();
    });
    root.addEventListener("focusin", () => {
      interacting = true;
      stop();
    });
    root.addEventListener("focusout", () => {
      window.setTimeout(() => {
        interacting = root.contains(document.activeElement);
        start();
      }, 0);
    });
    document.addEventListener("visibilitychange", start);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView) start();
        else stop();
      },
      { threshold: 0.38 },
    );
    observer.observe(root);
  };

  const performanceContent = [
    {
      state: "CAPTURED",
      value: "82",
      unit: "FQI",
      heights: [26, 44, 38, 67, 56, 82, 71, 92, 78, 88],
    },
    {
      state: "ACCELERATED",
      value: "6.4",
      unit: "M/S",
      heights: [18, 26, 35, 49, 63, 78, 91, 86, 74, 69],
    },
    {
      state: "CONFIRMED",
      value: "4.8",
      unit: "W/KG",
      heights: [31, 48, 42, 65, 61, 74, 83, 96, 88, 92],
    },
  ];

  const initPerformanceDemo = () => {
    const root = document.querySelector("[data-performance-demo]");
    const controls = [...document.querySelectorAll("[data-performance-index]")];
    const state = document.querySelector("[data-performance-state]");
    const value = document.querySelector("[data-performance-value]");
    const unit = document.querySelector("[data-performance-unit]");
    const bars = [...document.querySelectorAll(".monitor-wave > i")];
    if (!root || !controls.length || !state || !value || !unit || !bars.length) return;

    let currentIndex = 0;
    const activate = (index) => {
      currentIndex = index;
      const content = performanceContent[index];
      controls.forEach((control, controlIndex) => {
        const active = controlIndex === index;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-selected", String(active));
        control.tabIndex = active ? 0 : -1;
      });
      state.textContent = content.state;
      value.textContent = content.value;
      unit.textContent = content.unit;
      bars.forEach((bar, barIndex) => {
        bar.style.setProperty("--h", `${content.heights[barIndex]}%`);
      });
      replayClass(root, "is-switching");
    };

    controls.forEach((control, index) => {
      control.addEventListener("click", () => activate(index));
      control.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + controls.length) % controls.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % controls.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = controls.length - 1;
        controls[nextIndex].focus();
        activate(nextIndex);
      });
    });

    activate(0);
    createAutoCycle(root, controls.length, 3600, () => currentIndex, activate);
  };

  const initCampTabs = () => {
    const tabs = [...document.querySelectorAll("[data-camp-tab]")];
    const panels = [...document.querySelectorAll("[data-camp-panel]")];
    if (!tabs.length || !panels.length) return;

    const activate = (key) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.campTab === key;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        const active = panel.dataset.campPanel === key;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.campTab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        tabs[nextIndex].focus();
        activate(tabs[nextIndex].dataset.campTab);
      });
    });

    const initialTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
    activate(initialTab.dataset.campTab);
  };

  const initCycleDemo = () => {
    const root = document.querySelector("[data-cycle-demo]");
    const controls = [...document.querySelectorAll("[data-cycle-week]")];
    const day = document.querySelector("[data-cycle-day]");
    if (!root || !controls.length || !day) return;

    const days = [7, 14, 21, 28];
    let currentIndex = 0;
    const activate = (index) => {
      currentIndex = index;
      controls.forEach((control, controlIndex) => {
        const active = controlIndex === index;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-selected", String(active));
        control.tabIndex = active ? 0 : -1;
      });
      day.textContent = String(days[index]);
      root.style.setProperty("--cycle-angle", `${(index + 1) * 90}deg`);
      replayClass(root, "is-updating");
    };

    controls.forEach((control, index) => {
      control.addEventListener("click", () => activate(index));
      control.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + controls.length) % controls.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % controls.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = controls.length - 1;
        controls[nextIndex].focus();
        activate(nextIndex);
      });
    });

    activate(0);
    createAutoCycle(root, controls.length, 3200, () => currentIndex, activate);
  };

  const platformContent = [
    {
      label: "VENUE DELIVERY",
      title: "稳定体验与高质量服务",
      text: "北京双店承接评估、训练、复测与社群体验，让专业标准在真实场景中持续验证。",
      metric: "2×",
      unit: "VENUE",
    },
    {
      label: "ONLINE TRAINING",
      title: "突破单店半径，扩大用户池",
      text: "周期化课程、训练群答疑与数据反馈协同，把教练能力扩展到全国并沉淀长期信任。",
      metric: "28D",
      unit: "CYCLE",
    },
    {
      label: "EVENT IP",
      title: "形成可复制的赛事与内容事件",
      text: "VORK 以标准化赛制连接高校、城市、品牌与训练场馆，建立全年运动消费关系。",
      metric: "5×",
      unit: "SCENARIO",
    },
    {
      label: "DIGITAL SYSTEM",
      title: "提升交付效率与数据沉淀",
      text: "SSP Online 与动作捕捉系统让训练负荷、功率、恢复和技术表现持续可读、可复盘。",
      metric: "SYNC",
      unit: "FEEDBACK",
    },
    {
      label: "PRODUCT MATRIX",
      title: "围绕已验证需求延伸复购",
      text: "用户问题先在训练场被发现，再进入营养、服饰、护具与器械的产品定义和迭代。",
      metric: "4×",
      unit: "MATRIX",
    },
  ];

  const initPlatformMap = () => {
    const controls = [...document.querySelectorAll("[data-platform-index]")];
    const label = document.querySelector("[data-platform-label]");
    const title = document.querySelector("[data-platform-title]");
    const text = document.querySelector("[data-platform-text]");
    const metric = document.querySelector("[data-platform-metric]");
    const unit = document.querySelector("[data-platform-unit]");
    const root = document.querySelector("[data-platform-demo]");
    if (!controls.length || !label || !title || !text || !metric || !unit || !root) return;

    let currentIndex = 0;
    const activate = (index) => {
      currentIndex = index;
      controls.forEach((control, controlIndex) => {
        const active = controlIndex === index;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-selected", String(active));
        control.tabIndex = active ? 0 : -1;
      });
      label.textContent = platformContent[index].label;
      title.textContent = platformContent[index].title;
      text.textContent = platformContent[index].text;
      metric.textContent = platformContent[index].metric;
      unit.textContent = platformContent[index].unit;
      replayClass(root, "is-updating");
    };

    controls.forEach((control, index) => {
      control.addEventListener("click", () => activate(index));
      control.addEventListener("mouseenter", () => activate(index));
      control.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + controls.length) % controls.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % controls.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = controls.length - 1;
        controls[nextIndex].focus();
        activate(nextIndex);
      });
    });

    const initialIndex = Math.max(
      0,
      controls.findIndex((control) => control.getAttribute("aria-selected") === "true"),
    );
    activate(initialIndex);
    createAutoCycle(root, controls.length, 4400, () => currentIndex, activate);
  };

  const digitalContent = [
    {
      label: "TRAINING LOAD",
      title: "训练负荷与周期变化",
      text: "结合训练量、强度与主观感受，识别周期节奏与恢复窗口。",
      metric: "LOAD INDEX",
      value: "82",
      unit: "AU",
      trend: "+12%",
      heights: [32, 46, 39, 62, 74, 58, 82, 69, 88, 76],
    },
    {
      label: "POWER PROFILE",
      title: "跳跃、冲刺与力量表现",
      text: "追踪输出水平、速度变化与动作质量，判断专项表现的发展方向。",
      metric: "PEAK POWER",
      value: "4.8",
      unit: "W/KG",
      trend: "+8.6%",
      heights: [38, 52, 68, 44, 78, 91, 63, 84, 72, 96],
    },
    {
      label: "RECOVERY STATUS",
      title: "睡眠、RPE 与准备度",
      text: "把恢复状态与训练反馈放在同一界面，支持负荷调整与周期复盘。",
      metric: "READINESS",
      value: "91",
      unit: "%",
      trend: "READY",
      heights: [72, 68, 76, 83, 79, 88, 86, 92, 89, 91],
    },
  ];

  const initDigitalSystem = () => {
    const controls = [...document.querySelectorAll("[data-digital-index]")];
    const label = document.querySelector("[data-digital-label]");
    const title = document.querySelector("[data-digital-title]");
    const text = document.querySelector("[data-digital-text]");
    const metric = document.querySelector("[data-console-metric]");
    const value = document.querySelector("[data-console-value]");
    const unit = document.querySelector("[data-console-unit]");
    const trend = document.querySelector("[data-console-trend]");
    const root = document.querySelector(".digital-stage");
    const console = document.querySelector("[data-digital-console]");
    const bars = [...document.querySelectorAll(".console-chart > i")];
    if (
      !controls.length ||
      !label ||
      !title ||
      !text ||
      !metric ||
      !value ||
      !unit ||
      !trend ||
      !root ||
      !console
    ) {
      return;
    }

    let currentIndex = 0;
    const activate = (index) => {
      currentIndex = index;
      const content = digitalContent[index];
      controls.forEach((control, controlIndex) => {
        const active = controlIndex === index;
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-selected", String(active));
        control.tabIndex = active ? 0 : -1;
      });
      label.textContent = content.label;
      title.textContent = content.title;
      text.textContent = content.text;
      metric.textContent = content.metric;
      value.textContent = content.value;
      unit.textContent = content.unit;
      trend.textContent = content.trend;
      bars.forEach((bar, barIndex) => {
        bar.style.setProperty("--h", `${content.heights[barIndex]}%`);
      });
      replayClass(console, "is-analyzing");
    };

    controls.forEach((control, index) => {
      control.addEventListener("click", () => activate(index));
      control.addEventListener("mouseenter", () => activate(index));
      control.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + controls.length) % controls.length;
        }
        if (event.key === "ArrowRight") nextIndex = (index + 1) % controls.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = controls.length - 1;
        controls[nextIndex].focus();
        activate(nextIndex);
      });
    });

    const initialIndex = Math.max(
      0,
      controls.findIndex((control) => control.getAttribute("aria-selected") === "true"),
    );
    activate(initialIndex);
    createAutoCycle(root, controls.length, 4200, () => currentIndex, activate);
  };

  const raceContent = [
    {
      label: "RACE DESIGN",
      text: "从能量代谢、动作模式与执行关键事件出发，校准项目顺序、难度梯度和完赛体验。",
    },
    {
      label: "MOVEMENT STANDARD",
      text: "把动作路径、有效重复、器械规格和判定条件写成可训练、可执裁、可复用的项目标准。",
    },
    {
      label: "JUDGING & SAFETY",
      text: "统一裁判口令、处罚逻辑、动线管理与现场安全规范，保障赛事公平和高质量交付。",
    },
    {
      label: "CITY DELIVERY",
      text: "根据高校、城市文旅、商业综合体和景区等场景，设计适配的赛事版本与现场体验。",
    },
    {
      label: "CONTENT SYSTEM",
      text: "围绕体测、训练、备赛、赛场与人物故事持续生产内容，沉淀赛事品牌与运动社群。",
    },
  ];

  const initRaceSystem = () => {
    const nodes = [...document.querySelectorAll("[data-race-index]")];
    const label = document.querySelector("[data-race-label]");
    const text = document.querySelector("[data-race-text]");
    const line = document.querySelector(".race-line");
    if (!nodes.length || !label || !text || !line) return;

    const activate = (index) => {
      nodes.forEach((node, nodeIndex) => {
        const active = nodeIndex === index;
        node.classList.toggle("is-active", active);
        node.setAttribute("aria-pressed", String(active));
      });
      label.textContent = raceContent[index].label;
      text.textContent = raceContent[index].text;
      line.style.setProperty("--progress", `${((index + 1) / nodes.length) * 100}%`);
    };

    nodes.forEach((node, index) => {
      node.addEventListener("click", () => activate(index));
      node.addEventListener("mouseenter", () => activate(index));
      node.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + nodes.length) % nodes.length;
        }
        if (event.key === "ArrowRight") nextIndex = (index + 1) % nodes.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = nodes.length - 1;
        nodes[nextIndex].focus();
        activate(nextIndex);
      });
    });

    activate(0);
  };

  const initGallery = () => {
    const dialog = document.querySelector("[data-gallery-dialog]");
    const image = document.querySelector("[data-dialog-image]");
    const caption = document.querySelector("[data-dialog-caption]");
    const counter = document.querySelector("[data-dialog-counter]");
    const closeButton = document.querySelector("[data-dialog-close]");
    const previousButton = document.querySelector("[data-dialog-prev]");
    const nextButton = document.querySelector("[data-dialog-next]");
    const triggers = [...document.querySelectorAll("[data-gallery-src]")];
    if (
      !dialog ||
      !image ||
      !caption ||
      !counter ||
      !closeButton ||
      !previousButton ||
      !nextButton ||
      !triggers.length
    ) {
      return;
    }

    let activeIndex = 0;
    let activeTrigger = null;
    let swipeStartX = null;

    const close = () => {
      if (dialog.open) dialog.close();
    };

    const render = (index, animate = true) => {
      activeIndex = (index + triggers.length) % triggers.length;
      const trigger = triggers[activeIndex];
      const preview = trigger.querySelector("img");
      const source = preview?.currentSrc || preview?.src || trigger.dataset.gallerySrc;

      if (animate) image.classList.add("is-switching");
      window.setTimeout(
        () => {
          image.src = source;
          image.alt = trigger.dataset.galleryCaption;
          caption.textContent = trigger.dataset.galleryCaption;
          counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(
            triggers.length,
          ).padStart(2, "0")}`;
          image.classList.remove("is-switching");
        },
        animate && !reducedMotion ? 160 : 0,
      );

      const adjacent = triggers[(activeIndex + 1) % triggers.length].querySelector("img");
      if (adjacent?.src) {
        const preload = new Image();
        preload.src = adjacent.currentSrc || adjacent.src;
      }
    };

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => {
        activeTrigger = trigger;
        render(index, false);
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        }
      });
    });

    previousButton.addEventListener("click", () => render(activeIndex - 1));
    nextButton.addEventListener("click", () => render(activeIndex + 1));
    closeButton.addEventListener("click", close);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        render(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        render(activeIndex + 1);
      }
    });

    dialog.addEventListener("pointerdown", (event) => {
      swipeStartX = event.clientX;
    });

    dialog.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const distance = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(distance) < 48) return;
      render(activeIndex + (distance < 0 ? 1 : -1));
    });

    dialog.addEventListener("close", () => {
      activeTrigger?.focus({ preventScroll: true });
    });
  };

  const initSurfaceGlow = () => {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const surfaces = [
      ...document.querySelectorAll(
        ".business-card, .venue-card, .founder-card, .platform-map, .digital-stage, .product-matrix article",
      ),
    ];

    surfaces.forEach((surface) => {
      surface.classList.add("interactive-surface");
      surface.addEventListener("pointermove", (event) => {
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        surface.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      });
    });
  };

  const initHeroMotion = () => {
    if (!heroVisual || reducedMotion || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const hero = heroVisual.closest(".hero");
    hero?.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty("--mx", `${x * 18}px`);
      heroVisual.style.setProperty("--my", `${y * 14}px`);
    });

    hero?.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--mx", "0px");
      heroVisual.style.setProperty("--my", "0px");
    });
  };

  const initScrollSpy = () => {
    const links = [...document.querySelectorAll(".desktop-nav a")];
    const pairs = links
      .map((link) => {
        const id = link.getAttribute("href");
        return { link, section: id ? document.querySelector(id) : null };
      })
      .filter((pair) => pair.section);
    if (!pairs.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        pairs.forEach(({ link, section }) => {
          const active = section === visible.target;
          link.classList.toggle("is-active", active);
          if (active) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { threshold: [0.15, 0.35, 0.6], rootMargin: "-20% 0px -55% 0px" },
    );

    pairs.forEach(({ section }) => observer.observe(section));
  };

  setYear();
  initMenu();
  initReveal();
  initCounters();
  initPerformanceDemo();
  initCampTabs();
  initCycleDemo();
  initPlatformMap();
  initDigitalSystem();
  initRaceSystem();
  initGallery();
  initSurfaceGlow();
  initHeroMotion();
  initScrollSpy();
  updateScrollUI();

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateScrollUI();
        ticking = false;
      });
    },
    { passive: true },
  );
})();
