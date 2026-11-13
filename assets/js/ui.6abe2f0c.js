/* Devenport product-page widgets: promo meter. Reads the cart config, shows honest numbers only. */
!function (w, d) {
  "use strict";
  var box = d.querySelector("[data-deal]"), qtyEl = d.getElementById("qtyVal");
  if (!box || !qtyEl || !w.DPCart) return;
  var cfg = (w.DP_CONFIG && w.DP_CONFIG.promo) || {}, price = +box.getAttribute("data-price");
  var row = box.querySelector("[data-deal-sum]"), msg = box.querySelector("[data-deal-msg]");
  var bar = box.querySelector(".deal__bar i");
  function money(n) { return w.DPCart.money(n); }
  function paint() {
    var qty = Math.max(1, +qtyEl.textContent || 1), total = price * qty;
    var need = cfg.minItems || 2, have = w.DPCart.count() + qty;
    if (!w.DPCart.promoActive()) { box.hidden = true; return; }
    var on = have >= need, off = on ? Math.round(total * (cfg.percent || 10) / 100) : 0;
    box.classList.toggle("is-on", on);
    bar.style.width = Math.min(100, Math.round(have / need * 100)) + "%";
    row.innerHTML = (on ? "<s>" + money(total) + "</s>" : "") + "<b>" + money(total - off) + "</b>";
    msg.textContent = on
      ? "Знижка −" + (cfg.percent || 10) + "% застосована: економія " + money(off) + ". Остаточну суму бачите в кошику."
      : "Додайте ще " + (need - have) + " од. — і діятиме знижка −" + (cfg.percent || 10) + "% до " + (cfg.untilLabel || "") + ".";
  }
  new MutationObserver(paint).observe(qtyEl, { childList: true, characterData: true, subtree: true });
  w.DPCart.subscribe(paint);
  paint();
}(window, document);

/* Gallery: hover zoom (mouse) + fullscreen viewer (click / tap) */
!function (w, d) {
  "use strict";
  var main = d.querySelector(".gal__main"), img = d.getElementById("mainImg");
  if (!main || !img) return;
  var thumbs = [].slice.call(d.querySelectorAll(".thumbs button"));
  var srcs = thumbs.length ? thumbs.map(function (b) { return b.getAttribute("data-src"); }) : [img.currentSrc || img.src];
  var fine = w.matchMedia && w.matchMedia("(hover:hover) and (pointer:fine)").matches;
  main.setAttribute("role", "button"); main.setAttribute("tabindex", "0");
  main.setAttribute("aria-label", "Відкрити фото на весь екран");
  if (fine) {
    main.addEventListener("mousemove", function (e) {
      var r = main.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%";
      main.classList.add("is-zoom");
    });
    main.addEventListener("mouseleave", function () { main.classList.remove("is-zoom"); });
  }
  var lb, cur = 0, opener;
  function indexOfCurrent() {
    var s = img.getAttribute("src"), i = srcs.indexOf(s);
    return i < 0 ? 0 : i;
  }
  function show(i) {
    cur = (i + srcs.length) % srcs.length;
    lb.querySelector("img").src = srcs[cur];
    lb.querySelector(".lb__n").textContent = (cur + 1) + " / " + srcs.length;
  }
  function close() {
    if (!lb) return;
    d.removeEventListener("keydown", key); lb.remove(); lb = null; d.body.style.overflow = "";
    if (opener) opener.focus();
  }
  function key(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight" && srcs.length > 1) show(cur + 1);
    else if (e.key === "ArrowLeft" && srcs.length > 1) show(cur - 1);
  }
  function open() {
    if (lb) return;
    opener = d.activeElement;
    lb = d.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Фото товару");
    lb.innerHTML = '<button type="button" class="lb__x" aria-label="Закрити">×</button>' +
      (srcs.length > 1 ? '<button type="button" class="lb__p lb__a" aria-label="Попереднє фото">‹</button><button type="button" class="lb__nx lb__a" aria-label="Наступне фото">›</button>' : '') +
      '<img alt=""><span class="lb__n"></span>';
    lb.querySelector("img").alt = img.alt || "";
    d.body.appendChild(lb); d.body.style.overflow = "hidden";
    show(indexOfCurrent());
    lb.addEventListener("click", function (e) {
      var t = e.target;
      if (t.classList.contains("lb__x") || t === lb) close();
      else if (t.classList.contains("lb__p")) show(cur - 1);
      else if (t.classList.contains("lb__nx")) show(cur + 1);
    });
    d.addEventListener("keydown", key);
    lb.querySelector(".lb__x").focus();
  }
  main.addEventListener("click", open);
  main.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
}(window, document);

/* Buy-now buttons (sticky bar, closing banner), swipe on the gallery, photo counter */
!function (w, d) {
  "use strict";
  var qtyEl = d.getElementById("qtyVal");
  [].slice.call(d.querySelectorAll("[data-buy-now]")).forEach(function (b) {
    b.addEventListener("click", function () {
      var id = +b.getAttribute("data-buy-now"), n = Math.max(1, +(qtyEl && qtyEl.textContent) || 1);
      if (!w.DPCart) return;
      var item = w.DPCart.byId(id);
      w.DPCart.add(id, n);
      if (w.Tracking && item) w.Tracking.addToCart(item, n);
      setTimeout(function () { location.href = w.DP ? w.DP.url("/koshyk/") : "/koshyk/"; }, 120);
    });
  });
  var main = d.querySelector(".gal__main"), thumbs = [].slice.call(d.querySelectorAll(".thumbs button"));
  if (!main || thumbs.length < 2) return;
  var n = d.createElement("span"); n.className = "gal__n"; n.setAttribute("aria-hidden", "true"); main.appendChild(n);
  function cur() { for (var i = 0; i < thumbs.length; i++) if (thumbs[i].classList.contains("is-active")) return i; return 0; }
  function paint() { n.textContent = (cur() + 1) + " / " + thumbs.length; }
  thumbs.forEach(function (t) { t.addEventListener("click", function () { setTimeout(paint, 0); }); });
  paint();
  var x0, y0, swiped = false;
  main.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; swiped = false; }, { passive: true });
  main.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    swiped = true;
    thumbs[(cur() + (dx < 0 ? 1 : thumbs.length - 1)) % thumbs.length].click();
  }, { passive: true });
  main.addEventListener("click", function (e) { if (swiped) { e.stopImmediatePropagation(); e.preventDefault(); swiped = false; } }, true);
}(window, document);
