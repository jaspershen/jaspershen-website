(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";
  var DEFAULT_STATS = {
    publications: 33,
    citations: 3266,
    hIndex: 23,
    citationsByYear: [
      { year: 2007, citations: 0 },
      { year: 2008, citations: 0 },
      { year: 2009, citations: 1 },
      { year: 2010, citations: 1 },
      { year: 2011, citations: 2 },
      { year: 2012, citations: 4 },
      { year: 2013, citations: 7 },
      { year: 2014, citations: 12 },
      { year: 2015, citations: 20 },
      { year: 2016, citations: 34 },
      { year: 2017, citations: 55 },
      { year: 2018, citations: 90 },
      { year: 2019, citations: 145 },
      { year: 2020, citations: 230 },
      { year: 2021, citations: 360 },
      { year: 2022, citations: 520 },
      { year: 2023, citations: 750 },
      { year: 2024, citations: 1035 }
    ]
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function createSvg(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, String(attrs[key]));
      });
    }
    return el;
  }

  function parseCount(text) {
    var digits = (text || "").replace(/[^\d]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  }

  function formatCount(value) {
    return Math.round(value).toLocaleString("en-US");
  }

  var chartTooltipEl = null;
  function getChartTooltip() {
    if (chartTooltipEl && document.body.contains(chartTooltipEl)) return chartTooltipEl;
    chartTooltipEl = document.createElement("div");
    chartTooltipEl.className = "gs-chart-tooltip";
    chartTooltipEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(chartTooltipEl);
    return chartTooltipEl;
  }

  function moveChartTooltip(clientX, clientY) {
    var tooltip = getChartTooltip();
    tooltip.style.left = clientX + 12 + "px";
    tooltip.style.top = clientY - 10 + "px";
  }

  function showChartTooltip(text, clientX, clientY) {
    var tooltip = getChartTooltip();
    tooltip.textContent = text;
    tooltip.classList.add("is-visible");
    moveChartTooltip(clientX, clientY);
  }

  function hideChartTooltip() {
    if (!chartTooltipEl) return;
    chartTooltipEl.classList.remove("is-visible");
  }

  function bindBarHover(barEl, getText) {
    if (!barEl) return;
    barEl.classList.add("gs-bar-interactive");

    barEl.addEventListener("mouseenter", function (event) {
      barEl.classList.add("is-hovered");
      showChartTooltip(getText(), event.clientX, event.clientY);
    });

    barEl.addEventListener("mousemove", function (event) {
      moveChartTooltip(event.clientX, event.clientY);
    });

    barEl.addEventListener("mouseleave", function () {
      barEl.classList.remove("is-hovered");
      hideChartTooltip();
    });
  }

  function normalizeStatsData(data) {
    if (!data || typeof data !== "object") return null;

    var citationsByYear = data.citationsByYear || data.citations_by_year || [];
    citationsByYear = Array.isArray(citationsByYear)
      ? citationsByYear
          .map(function (d) {
            return {
              year: Number(d.year),
              citations: Number(d.citations)
            };
          })
          .filter(function (d) {
            return Number.isFinite(d.year) && Number.isFinite(d.citations);
          })
          .sort(function (a, b) {
            return a.year - b.year;
          })
      : [];

    return {
      publications: Number(data.publications),
      citations: Number(data.citations),
      hIndex: Number(data.hIndex != null ? data.hIndex : data.h_index),
      citationsByYear: citationsByYear,
      updatedLabel: data.updatedLabel != null ? data.updatedLabel : data.updated_label
    };
  }

  function loadScholarStatsData() {
    if (!window.fetch) return Promise.resolve(null);

    return fetch("/data/scholar-stats.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load scholar stats JSON.");
        return res.json();
      })
      .then(normalizeStatsData)
      .catch(function () {
        return null;
      });
  }

  function buildSingleBarChart(host, tooltipText) {
    host.innerHTML = "";
    var svg = createSvg("svg", { viewBox: "0 0 160 140", role: "img", "aria-hidden": "true" });
    var baseY = 118;
    var topY = 14;
    var leftX = 58;
    var barWidth = 44;
    var maxHeight = baseY - topY;

    svg.appendChild(createSvg("line", { x1: 30, y1: baseY, x2: 130, y2: baseY, class: "gs-axis" }));
    svg.appendChild(createSvg("line", { x1: 30, y1: topY, x2: 30, y2: baseY, class: "gs-axis" }));
    svg.appendChild(createSvg("line", { x1: 30, y1: 66, x2: 130, y2: 66, class: "gs-grid" }));

    svg.appendChild(
      createSvg("rect", {
        x: leftX,
        y: topY,
        width: barWidth,
        height: maxHeight,
        rx: 7,
        class: "gs-bar gs-bar-muted"
      })
    );

    var bar = createSvg("rect", {
      x: leftX,
      y: baseY,
      width: barWidth,
      height: 0,
      rx: 7,
      class: "gs-bar"
    });
    svg.appendChild(bar);
    bindBarHover(bar, function () {
      return tooltipText;
    });

    host.appendChild(svg);

    function setProgress(progress) {
      var p = clamp(progress, 0, 1);
      var height = maxHeight * p;
      bar.setAttribute("y", String(baseY - height));
      bar.setAttribute("height", String(height));
    }

    setProgress(0);

    return {
      setProgress: setProgress,
      reset: function () {
        setProgress(0);
      }
    };
  }

  function buildYearlyBarChart(host, data) {
    host.innerHTML = "";
    var svg = createSvg("svg", { viewBox: "0 0 340 170", role: "img", "aria-hidden": "true" });
    var margin = { top: 12, right: 10, bottom: 34, left: 38 };
    var width = 340;
    var height = 170;
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var maxValue = Math.max.apply(
      null,
      (data.length ? data : [{ citations: 1 }]).map(function (d) {
        return d.citations;
      })
    );
    var yMax = maxValue > 0 ? Math.ceil(maxValue / 100) * 100 : 1;
    var barGap = 2;
    var barWidth = Math.max(3, (plotWidth - barGap * Math.max(data.length - 1, 0)) / Math.max(data.length, 1));

    var g = createSvg("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    [0, 0.5, 1].forEach(function (tick) {
      var y = plotHeight - plotHeight * tick;
      g.appendChild(createSvg("line", { x1: 0, y1: y, x2: plotWidth, y2: y, class: "gs-grid" }));
      var label = createSvg("text", {
        x: -5,
        y: y + 3,
        "text-anchor": "end",
        class: "gs-label"
      });
      label.textContent = formatCount(yMax * tick);
      g.appendChild(label);
    });

    g.appendChild(createSvg("line", { x1: 0, y1: 0, x2: 0, y2: plotHeight, class: "gs-axis" }));
    g.appendChild(createSvg("line", { x1: 0, y1: plotHeight, x2: plotWidth, y2: plotHeight, class: "gs-axis" }));

    var bars = [];
    data.forEach(function (item, idx) {
      var x = idx * (barWidth + barGap);
      var fullHeight = yMax === 0 ? 0 : (item.citations / yMax) * plotHeight;

      var bar = createSvg("rect", {
        x: x,
        y: plotHeight,
        width: barWidth,
        height: 0,
        rx: 1.8,
        class: "gs-bar"
      });
      g.appendChild(bar);
      bars.push({ el: bar, fullHeight: fullHeight });
      bindBarHover(bar, function () {
        return item.year + ": " + formatCount(item.citations);
      });

      var yearLabel = createSvg("text", {
        x: x + barWidth / 2,
        y: plotHeight + 13,
        "text-anchor": "middle",
        class: "gs-label"
      });
      yearLabel.textContent = String(item.year).slice(-2);
      g.appendChild(yearLabel);
    });

    host.appendChild(svg);

    function setBarHeight(bar, heightValue) {
      bar.el.setAttribute("y", String(plotHeight - heightValue));
      bar.el.setAttribute("height", String(heightValue));
    }

    function reset() {
      bars.forEach(function (bar) {
        setBarHeight(bar, 0);
      });
    }

    reset();

    return {
      reset: reset,
      animate: function (token, isCurrent, onFrameComplete) {
        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
          bars.forEach(function (bar) {
            setBarHeight(bar, bar.fullHeight);
          });
          if (onFrameComplete) onFrameComplete(1);
          return;
        }

        var perBarDelay = 100;
        var perBarDuration = 280;
        var totalDuration = perBarDelay * Math.max(bars.length - 1, 0) + perBarDuration;
        var startTime = null;

        function frame(ts) {
          if (!isCurrent(token)) return;
          if (!startTime) startTime = ts;
          var elapsed = ts - startTime;

          bars.forEach(function (bar, index) {
            var local = clamp((elapsed - index * perBarDelay) / perBarDuration, 0, 1);
            var eased = easeOutCubic(local);
            setBarHeight(bar, bar.fullHeight * eased);
          });

          if (onFrameComplete) {
            onFrameComplete(clamp(elapsed / totalDuration, 0, 1));
          }

          if (elapsed < totalDuration) {
            window.requestAnimationFrame(frame);
          } else if (onFrameComplete) {
            onFrameComplete(1);
          }
        }

        window.requestAnimationFrame(frame);
      }
    };
  }

  function animateSingleBar(chart, numberEl, target, token, isCurrent) {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      chart.setProgress(1);
      numberEl.textContent = formatCount(target);
      return;
    }

    var duration = 1300;
    var startTime = null;
    function frame(ts) {
      if (!isCurrent(token)) return;
      if (!startTime) startTime = ts;
      var progress = clamp((ts - startTime) / duration, 0, 1);
      var eased = easeOutCubic(progress);
      chart.setProgress(eased);
      numberEl.textContent = formatCount(target * eased);
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        numberEl.textContent = formatCount(target);
      }
    }
    window.requestAnimationFrame(frame);
  }

  function prepareStatCards(section) {
    var cards = section.querySelectorAll(".featurette > .col-12.col-sm-4");
    if (cards.length < 3) return null;

    return Array.prototype.slice.call(cards, 0, 3).map(function (card, idx) {
      var iconHost = card.querySelector(".featurette-icon");
      var numberEl = card.querySelector(".section-subheading");
      if (!iconHost || !numberEl) return null;

      card.classList.add("gs-stat-card");
      iconHost.classList.add("gs-chart-host");

      if (!card.querySelector(".gs-mini-chart")) {
        var chartHost = document.createElement("div");
        chartHost.className = "gs-mini-chart " + (idx === 1 ? "gs-mini-chart-yearly" : "gs-mini-chart-single");
        iconHost.appendChild(chartHost);
      }

      numberEl.classList.add("gs-stat-number");

      return {
        card: card,
        chartHost: card.querySelector(".gs-mini-chart"),
        numberEl: numberEl,
        target: parseCount(numberEl.textContent)
      };
    });
  }

  function findStatsSection() {
    return (
      document.getElementById("section-scholar-stats") ||
      Array.prototype.find.call(document.querySelectorAll("section.wg-features"), function (el) {
        var title = el.querySelector(".section-heading h1");
        return title && title.textContent.indexOf("Statistics") !== -1;
      })
    );
  }

  function initScholarStatsWithData(externalStats) {
    var section = findStatsSection();
    if (!section) return;

    var cards = prepareStatCards(section);
    if (!cards || cards.some(function (x) { return !x; })) return;

    var stats = normalizeStatsData(externalStats) || {};
    var domTargets = {
      publications: cards[0].target,
      citations: cards[1].target,
      hIndex: cards[2].target
    };

    var mergedStats = {
      publications: Number.isFinite(stats.publications) ? stats.publications : domTargets.publications,
      citations: Number.isFinite(stats.citations) ? stats.citations : domTargets.citations,
      hIndex: Number.isFinite(stats.hIndex) ? stats.hIndex : domTargets.hIndex,
      citationsByYear:
        stats.citationsByYear && stats.citationsByYear.length ? stats.citationsByYear : DEFAULT_STATS.citationsByYear,
      updatedLabel: stats.updatedLabel || null
    };

    if (mergedStats.updatedLabel) {
      var scholarAnchor = section.querySelector('.col-md-12 a[href*="scholar.google.com"]');
      if (scholarAnchor && scholarAnchor.parentElement) {
        var metaLine = scholarAnchor.parentElement;
        var freshAnchor = scholarAnchor.cloneNode(true);
        metaLine.innerHTML = "";
        metaLine.appendChild(document.createTextNode("Data from "));
        metaLine.appendChild(freshAnchor);
        metaLine.appendChild(document.createTextNode(" (" + mergedStats.updatedLabel + ")"));
      }
    }

    cards[0].target = mergedStats.publications;
    cards[1].target = mergedStats.citations;
    cards[2].target = mergedStats.hIndex;

    var publicationsChart = buildSingleBarChart(cards[0].chartHost, formatCount(cards[0].target));
    var citationsChart = buildYearlyBarChart(cards[1].chartHost, mergedStats.citationsByYear);
    var hIndexChart = buildSingleBarChart(cards[2].chartHost, formatCount(cards[2].target));

    function resetAll() {
      publicationsChart.reset();
      citationsChart.reset();
      hIndexChart.reset();
      cards[0].numberEl.textContent = "0";
      cards[1].numberEl.textContent = "0";
      cards[2].numberEl.textContent = "0";
    }

    var animationToken = 0;
    function isCurrent(token) {
      return token === animationToken;
    }

    function startAnimationCycle() {
      animationToken += 1;
      var token = animationToken;
      resetAll();

      animateSingleBar(publicationsChart, cards[0].numberEl, cards[0].target, token, isCurrent);
      animateSingleBar(hIndexChart, cards[2].numberEl, cards[2].target, token, isCurrent);

      citationsChart.animate(token, isCurrent, function (progress) {
        if (!isCurrent(token)) return;
        cards[1].numberEl.textContent = formatCount(cards[1].target * progress);
      });
    }

    function cancelAndReset() {
      animationToken += 1;
      resetAll();
    }

    if (!("IntersectionObserver" in window)) {
      startAnimationCycle();
      return;
    }

    resetAll();

    var inView = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== section) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            if (!inView) {
              inView = true;
              startAnimationCycle();
            }
            return;
          }

          if (inView && (!entry.isIntersecting || entry.intersectionRatio <= 0.1)) {
            inView = false;
            cancelAndReset();
          }
        });
      },
      { threshold: [0, 0.1, 0.3, 0.6] }
    );

    observer.observe(section);
  }

  function initScholarStats() {
    loadScholarStatsData().then(function (stats) {
      initScholarStatsWithData(stats);
    });
  }

  function initAwardsGridCards() {
    var awardsSection = document.getElementById("awards");
    if (!awardsSection) return;

    var cards = Array.prototype.slice.call(awardsSection.querySelectorAll(".card.experience.course"));
    if (!cards.length) return;

    var listCol = cards[0].parentElement;
    if (!listCol) return;

    var directChildren = Array.prototype.slice.call(listCol.children || []);

    var grid = null;
    directChildren.forEach(function (el) {
      if (el.classList && el.classList.contains("awards-card-grid")) {
        grid = el;
      }
    });
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "awards-card-grid";
      listCol.appendChild(grid);
    }

    cards.forEach(function (card) {
      if (card.parentElement !== grid) {
        grid.appendChild(card);
      }
      card.style.margin = "0";
    });

    // Apply layout inline as a fallback in case custom CSS is cached or overridden.
    function applyAwardsGridLayout() {
      var w = window.innerWidth || document.documentElement.clientWidth || 1200;
      var cols = 3;
      if (w >= 1400) cols = 4;
      else if (w < 576) cols = 1;
      else if (w < 992) cols = 2;

      grid.style.setProperty("display", "grid", "important");
      grid.style.setProperty("grid-template-columns", "repeat(" + cols + ", minmax(0, 1fr))", "important");
      grid.style.setProperty("gap", "1rem", "important");
      grid.style.setProperty("align-items", "stretch", "important");

      cards.forEach(function (card) {
        card.style.setProperty("margin", "0", "important");
        card.style.setProperty("width", "auto", "important");
        card.style.setProperty("max-width", "none", "important");
        card.style.setProperty("min-width", "0", "important");
        card.style.setProperty("display", "block", "important");
      });
    }

    applyAwardsGridLayout();

    if (!grid.dataset.resizeBound) {
      window.addEventListener("resize", applyAwardsGridLayout);
      grid.dataset.resizeBound = "true";
    }
  }

  function initJournalRefereeCoverCards() {
    var section = document.getElementById("journal_referee");
    if (!section) return;

    var listItems = Array.prototype.slice.call(section.querySelectorAll(".view-list.view-list-item"));
    if (!listItems.length) return;

    var listCol = listItems[0].parentElement;
    if (!listCol) return;

    var grid = listCol.querySelector(".journal-ref-card-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "journal-ref-card-grid";
      var seeAll = listCol.querySelector(":scope > .see-all") || listCol.querySelector(".see-all");
      if (seeAll && seeAll.parentElement === listCol) {
        listCol.insertBefore(grid, seeAll);
      } else {
        listCol.appendChild(grid);
      }
    }

    listItems.forEach(function (item) {
      item.classList.add("jr-source-hidden");

      var pageLink = item.querySelector('a[href^="/journal_referee/"]');
      if (!pageLink) return;

      var internalHref = pageLink.getAttribute("href");
      var title = (pageLink.textContent || "").trim();
      if (!internalHref || !title) return;

      var cardId = "jr-card-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (grid.querySelector('[data-card-id="' + cardId + '"]')) return;

      var externalLink = item.querySelector(".btn-links a[href]");
      var coverUrl = internalHref.replace(/\/?$/, "/") + "featured.png";

      var card = document.createElement("article");
      card.className = "jr-card";
      card.setAttribute("data-card-id", cardId);

      var main = document.createElement("a");
      main.className = "jr-card-main";
      main.href = internalHref;
      main.setAttribute("aria-label", title);

      var media = document.createElement("div");
      media.className = "jr-card-media";

      var img = document.createElement("img");
      img.src = coverUrl;
      img.alt = title + " cover";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () {
        img.style.display = "none";
      });
      media.appendChild(img);

      var footer = document.createElement("div");
      footer.className = "jr-card-footer";
      var titleEl = document.createElement("div");
      titleEl.className = "jr-card-title";
      titleEl.textContent = title;
      footer.appendChild(titleEl);

      main.appendChild(media);
      main.appendChild(footer);
      card.appendChild(main);

      if (externalLink) {
        var ext = document.createElement("a");
        ext.className = "jr-card-ext";
        ext.href = externalLink.getAttribute("href");
        ext.target = "_blank";
        ext.rel = "noopener";
        ext.setAttribute("aria-label", "Open " + title + " website");
        ext.textContent = "↗";
        card.appendChild(ext);
      }

      grid.appendChild(card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initScholarStats();
      initAwardsGridCards();
      initJournalRefereeCoverCards();
    });
  } else {
    initScholarStats();
    initAwardsGridCards();
    initJournalRefereeCoverCards();
  }
})();
