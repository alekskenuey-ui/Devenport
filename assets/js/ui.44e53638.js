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
