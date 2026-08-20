var FLYCO_IMG = (window.FLYCO_IMG || []);

(function(){
"use strict";
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- hero intro ---- */
requestAnimationFrame(function(){ var heroEl=document.getElementById("hero"); if(heroEl) heroEl.classList.add("ready"); });

/* ---- sticky enquire CTA (theme supplies the real header) ---- */
var sticky = document.getElementById("sticky");
if (sticky) window.addEventListener("scroll", function(){
  sticky.classList.toggle("up", window.scrollY > 600);
}, {passive:true});

/* ---- mobile nav ---- */
var themeBtn = document.getElementById("themeBtn");
if (themeBtn) themeBtn.addEventListener("click", function(){
  var root = document.documentElement, isDark = root.getAttribute("data-theme") === "dark", next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  themeBtn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", next === "dark" ? "#0b0b0b" : "#0d0d0d");
  try { var u = new URL(location.href); u.searchParams.set("theme", next); history.replaceState(null, "", u); } catch (e) {}
});

var burger = document.getElementById("burger"), nav = document.getElementById("mainnav");
if (burger && nav) {
burger.addEventListener("click", function(){
  var open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
nav.addEventListener("click", function(e){ if (e.target.tagName === "A") nav.classList.remove("open"); });
}

/* ---- scroll reveal with stagger ---- */
var targets = document.querySelectorAll("[data-anim], .reveal, .step, .mini-list");
if (reduce || !("IntersectionObserver" in window)) {
  targets.forEach(function(el){ el.classList.add("is-in"); });
} else {
  var io = new IntersectionObserver(function(en){
    en.forEach(function(e){
      if (!e.isIntersecting) return;
      var d = getComputedStyle(e.target).getPropertyValue("--d").trim();
      if (d) e.target.style.transitionDelay = d;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, {threshold:0.12, rootMargin:"0px 0px -60px 0px"});
  targets.forEach(function(el){ io.observe(el); });
}

/* ---- animated counters ---- */
function easeOut(t){ return 1 - Math.pow(1-t, 3); }
function runCount(el){
  var end = parseFloat(el.dataset.count),
      pre = el.dataset.prefix || "", suf = el.dataset.suffix || "",
      dur = 1700, t0 = null;
  function fmt(v){
    if (end >= 1000) return pre + Math.round(v).toLocaleString("en-US") + suf;
    return pre + Math.round(v) + suf;
  }
  if (reduce) { el.textContent = fmt(end); return; }
  function tick(ts){
    if (!t0) t0 = ts;
    var p = Math.min((ts - t0) / dur, 1);
    el.textContent = fmt(end * easeOut(p));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
var counters = document.querySelectorAll("[data-count]");
if (!("IntersectionObserver" in window)) { counters.forEach(runCount); }
else {
  var cio = new IntersectionObserver(function(en){
    en.forEach(function(e){ if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
  }, {threshold:0.5});
  counters.forEach(function(el){ cio.observe(el); });
}

/* ---- lightbox with caption + cycling ---- */
var lb = document.getElementById("lb"),
    lbFig = document.getElementById("lbfig"),
    lbImg = lbFig.querySelector("img"),
    lbTitle = document.getElementById("lbTitle"),
    lbNote = document.getElementById("lbNote"),
    lbCount = document.getElementById("lbCount"),
    lbPrev = document.getElementById("lbprev"),
    lbNext = document.getElementById("lbnext"),
    lbGroup = [], lbIdx = 0;

/* pull the title + context that already sit beside each image */
function shotInfo(shot){
  var step = shot.closest(".jstep"),
      img = shot.querySelector("img"),
      cap = shot.querySelector(".cap"),
      title = "", note = "";
  if (step) {
    var lbl = step.querySelector(".lbl"), p = step.querySelector("p");
    title = lbl ? lbl.textContent.trim() : "";
    note = p ? p.textContent.trim() : "";
  } else if (cap) {
    title = cap.textContent.trim();
  }
  if (!title) title = img && img.alt ? img.alt : "";
  else if (!note && img && img.alt && img.alt !== title) note = img.alt;
  return {src: img ? img.src : "", alt: img ? img.alt || "" : "", title: title, note: note};
}

function lbShow(i){
  if (!lbGroup.length) return;
  lbIdx = (i + lbGroup.length) % lbGroup.length;
  var info = shotInfo(lbGroup[lbIdx]);
  lbImg.src = info.src; lbImg.alt = info.alt;
  lbTitle.textContent = info.title;
  lbNote.textContent = info.note;
  lbCount.textContent = lbGroup.length > 1 ? (lbIdx + 1) + " / " + lbGroup.length : "";
  var many = lbGroup.length > 1;
  lbPrev.hidden = !many; lbNext.hidden = !many;
  lbFig.style.animation = "none"; void lbFig.offsetWidth; lbFig.style.animation = "";
}

document.querySelectorAll(".shot").forEach(function(s){
  s.addEventListener("click", function(){
    if (!s.querySelector("img")) return;
    /* cycle within the gallery this image belongs to */
    var scope = s.closest(".gal") || s.closest("section") || document;
    lbGroup = Array.prototype.slice.call(scope.querySelectorAll(".shot")).filter(function(x){ return x.querySelector("img"); });
    lbShow(lbGroup.indexOf(s));
    lb.classList.add("on"); document.body.style.overflow = "hidden";
  });
});

function closeLb(){ lb.classList.remove("on"); document.body.style.overflow = ""; }
lb.addEventListener("click", closeLb);
lbFig.addEventListener("click", function(e){ e.stopPropagation(); });
document.getElementById("lbCta").addEventListener("click", closeLb);
document.getElementById("lbx").addEventListener("click", closeLb);
lbPrev.addEventListener("click", function(e){ e.stopPropagation(); lbShow(lbIdx - 1); });
lbNext.addEventListener("click", function(e){ e.stopPropagation(); lbShow(lbIdx + 1); });
document.addEventListener("keydown", function(e){
  if (!lb.classList.contains("on")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
  if (e.key === "ArrowRight") lbShow(lbIdx + 1);
});

/* ---- ad attribution ---- */
var params = new URLSearchParams(window.location.search);
["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid"].forEach(function(k){
  var el = document.getElementById(k); if (el) el.value = params.get(k) || "";
});
document.getElementById("landing_page").value = window.location.href;
document.getElementById("referrer").value = document.referrer || "";

/* ---- form ---- */
var form = document.getElementById("enquiryForm");
function mark(input, bad){
  var f = input.closest(".field");
  input.classList.toggle("err", bad);
  if (f) f.classList.toggle("invalid", bad);
}
form.addEventListener("input", function(e){
  if (e.target.classList.contains("err") && e.target.value.trim()) mark(e.target, false);
});
form.addEventListener("submit", function(e){
  e.preventDefault();
  if (document.getElementById("company_website").value) return;
  var firstBad = null;
  form.querySelectorAll("[required]").forEach(function(input){
    var bad;
    if (input.type === "checkbox") { bad = !input.checked; input.style.outline = bad ? "2px solid #d24b32" : ""; }
    else if (input.type === "email") { bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()); mark(input, bad); }
    else { bad = !input.value.trim(); mark(input, bad); }
    if (bad && !firstBad) firstBad = input;
  });
  if (firstBad) { firstBad.focus(); return; }

  var data = {};
  new FormData(form).forEach(function(v,k){ data[k] = v; });

  /* ---- Klaviyo: identify the lead, then fire a custom event ---- */
  try {
    var _learnq = window._learnq = window._learnq || [];
    _learnq.push(["identify", {
      $email: data.email, $first_name: data.name,
      $phone_number: data.phone || "", $organization: data.company || "",
      Source: "Corporate Retreats Landing"
    }]);
    _learnq.push(["track", "Retreat Enquiry", {
      Company: data.company || "", Interest: data.interest || "",
      Budget: data.budget || "", Timing: data.timing || "",
      Destination: data.destination || "", Message: data.message || "",
      LandingPage: data.landing_page || "", Referrer: data.referrer || "",
      utm_source: data.utm_source || "", utm_medium: data.utm_medium || "",
      utm_campaign: data.utm_campaign || "", utm_content: data.utm_content || "",
      utm_term: data.utm_term || "", gclid: data.gclid || "", fbclid: data.fbclid || ""
    }]);
  } catch (err) { /* Klaviyo not loaded; the tracking below still fires */ }

  /* ---- Shopify native contact form: emails the store contact address ---- */
  /* Server-side delivery, so the enquiry survives even if Klaviyo is blocked. */
  try {
    var body = new URLSearchParams();
    body.append("form_type", "contact");
    body.append("utf8", "\u2713");
    body.append("contact[name]", data.name || "");
    body.append("contact[email]", data.email || "");
    body.append("contact[phone]", data.phone || "");
    body.append("contact[Company]", data.company || "");
    body.append("contact[Wants to run]", data.interest || "");
    body.append("contact[Budget]", data.budget || "");
    body.append("contact[Travel window]", data.timing || "");
    body.append("contact[Destination]", data.destination || "");
    body.append("contact[Landing page]", data.landing_page || "");
    body.append("contact[Referrer]", data.referrer || "");
    body.append("contact[Campaign]", [data.utm_source, data.utm_medium, data.utm_campaign].filter(Boolean).join(" / "));
    body.append("contact[body]",
      "Corporate retreat enquiry\n\n" +
      "Company: " + (data.company || "-") + "\n" +
      "Wants to run: " + (data.interest || "-") + "\n" +
      "Budget: " + (data.budget || "-") + "\n" +
      "Travel window: " + (data.timing || "-") + "\n" +
      "Destination: " + (data.destination || "-") + "\n\n" +
      "Message:\n" + (data.message || "-"));
    fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    }).catch(function(){});
  } catch (err) {}

  if (typeof fbq === "function") fbq("track", "Lead");
  if (typeof gtag === "function") gtag("event", "generate_lead", { currency:"SGD", value:1 });
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event:"flyco_enquiry_submitted", form_id:"corporate_retreats" });

  form.classList.add("sent");
  form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block:"center" });
});
/* ---- interactive destination map ---- */
(function(){
  var stage = document.getElementById("mapStage"), base = document.getElementById("mapBase"), fx = document.getElementById("mapFx");
  if (!stage || !base || !base.getContext) return;
  var bctx = base.getContext("2d"), fctx = fx.getContext("2d");

  /* land mask: 400 x 146 cells, 0.9 degrees per cell, lon -180..180, lat 76..-56 */
  var GX = 400, GY = 146, G0 = -180, GT = 76, GB = -56, GS = 0.9, G1 = 180;
  var MASK = "AAAAAAAAAAAD+eDifnwAAAH//////8AAAAAAAAAAAAAA/AAAAA////4AAAD/gAAAAAAAAAAAAAAAAAA4AAIf/gAAAP//////wAAAAAAAAAAAAAPAAAAA////4AAAACAAAAAAAAAAAAAAAAAD/gAAg+CAAAAAP/////+AAAAAAAAAAAAAHwAAAD/////8AAAADAAAAAAAAAAAAAAAAAf7oMD3j32gAAAf/////gAAAAAAAAAAAAA8AAcQP////////gAAAAAAAAAAAAAAAAAAD8//4PgP//gAAD/////8AAAAAAAAAAAAAHwAD5f////////+AB/+AAAAAMAAAHAAAAABB//wB4f//4AAB/////cAAAAAAAADAAAAHgA/v/////////+///+AAAABAAAP//gAAWAB//4HwP//8AAf/////gAAAAAAAf+AAAAAAB+////////////////AAAAAAD////x///H//DngeB/8AAH////wAAAAAAAP//wAAAAfD7/////////////////n/sAB/////////4HgGfx4A/gAB////wAAAAAAAD///+BAd9/v3///////////////////+AA///////////////wx/4AP///gAAAAAAAA/////Gf///+f////////////////////wE//////////////8AP/4Af//8AAAAAAAAH///n4f////3///////////////////3/H//////////////8AA/HAB//4AAf/AAAAB/+P/gf/////////////////////////BwH//////////////vB//gAD/+AAA/8AAAAP/x/+Z/////////////////////////4AAAf////////////w7gD/AAP/4AAA+AAAAD/+f////////////////////////////AAAf////////////+AAAHsAAP+AAAAAAAAA//D////////////////////////////+AAD/////////////gAF+AAAAf4AAAAAAAAP/4P/////////////////////////7/+AAAP//f/////////8AAH+AAAA/AAAAAAAAA//g/////////////////////////GP/AAADf/7h/////////gAAP+AAAAMAAAAAAAAD//hw///////////////////////wD8wAAAAP+YAH///////+AAB/4YAAAAAAAAAAAAPv8B///////////////////////PA4AAAAAAB4AAH///////+AAH/7wAAAAAAAAAAwAc/gP/////////////////////gAAHAAAAAAAG4AAB///////4AAH//gAAAAAAAAAHwAF8Cf////////////////////4AAD+AAAAAABgAAAB////////AAf//AAAAAAAAAAeABzwf/////////////////////AAAf4AAAAAA4AAAAH////////AD//+AAAAAAAAAA8AG8B/////////////////////wAAB/AAAAAAYAAAAAH////////4////AAAAAAAAAZ4AYAP////////////////////8AAAH8AAAAAAAAAAADP////////j///+AAAAAAAAHhwA+//////////////////////+yAAfAAAAAAAAAAAAA////////+P///8AAAAAAAAOfB/////////////////////////4AB4AAAAAAAAAAAAA////////8////wAAAAAAABx/H/////////////////////////gADAAAAAAAAAAAAAD////////////9AAAAAAAAAH9/////////////////////////yAAIAAAAAAAAAAAAAd///////////+IAAAAAAAAAwP/////////////////////////MAAAAAAAAAAAAAAAAb//////////hh0AAAAAAAAAP/////////////////////////8wAAAAAAAAAAAAAAAAb/////////7wP4AAAAAAAAH//////////////////////////yAAAAAAAAAAAAAAAAAv/////////fA/gAAAAAAAAP/////////////////////////+IAAAAAAAAAAAAAAAAD//////////+ACAAAAAAAAAP//////7//H///////////////wgAAAAAAAAAAAAAAAAP//////////5gAAAAAAAAAAf/////GP/wf//////////////+AAAAAAAAAAAAAAAAAA//////////84AAAAAAAAAAB//1//4Z/8H///////////////wQAAAAAAAAAAAAAAAAD/////////+EAAAAAAAAAAAP/nH//AB/w///////////////+B0AAAAAAAAAAAAAAAAP/////////wAAAAAAAAAAD//AOH/4AB/h///////////////gPgAAAAAAAAAAAAAAAA/////////+AAAAAAAAAAAP/4GcH/gAD/D//////////////gBoAAAAAAAAAAAAAAAAD/////////wAAAAAAAAAAA//gA8P/H4P8D/////////////8AAAAAAAAAAAAAAAAAAAP////////8AAAAAAAAAAAD/4Bg8+T///8f///////////8/gAYAAAAAAAAAAAAAAAAA/////////gAAAAAAAAAAAP/AGBjx////h////////////kcAAwAAAAAAAAAAAAAAAAB////////+AAAAAAAAAAAB/8AAAHD///8D///////////4B4AGAAAAAAAAAAAAAAAAAD////////gAAAAAAAAAAAD/gADgOP///4P///////////yHgA4AAAAAAAAAAAAAAAAAP////////AAAAAAAAAAAAB8A+CAwf///5////////////8HAPAAAAAAAAAAAAAAAAAAf///////8AAAAAAAAAAAAAD/8AAAAP///////////////A8B8AAAAAAAAAAAAAAAAAA////////gAAAAAAAAAAAAf//wABgM///////////////4Dh/wAAAAAAAAAAAAAAAAAA///////8AAAAAAAAAAAAD//+AAAAD///////////////wAdwAAAAAAAAAAAAAAAAAAB///////AAAAAAAAAAAAA///8AAAAf///////////////ADwAAAAAAAAAAAAAAAAAAAD//////4AAAAAAAAAAAAD////gcAB///////////////+AEAAAAAAAAAAAAAAAAAAAAM//////AAAAAAAAAAAAAf///+D/GP///////////////4AQAAAAAAAAAAAAAAAAAAAAb/////8AAAAAAAAAAAAB/////v//////////////////gAAAAAAAAAAAAAAAAAAAAAAn//+eBwAAAAAAAAAAAAH//////////j/////////////AAAAAAAAAAAAAAAAAAAAAABP//wADAAAAAAAAAAAAA////////X//H////////////4AAAAAAAAAAAAAAAAAAAAAAGf/8AAOAAAAAAAAAAAAP////////f/8f////////////AAAAAAAAAAAAAAAAAAAAAAAc//wAA4AAAAAAAAAAAB////////4//4d///////////8AAAAAAAAAAAAAAAAAAAAAAAT//AABgAAAAAAAAAAAP////////x//wL///////////gAAAAAAAAAAAAAAAAAAAAAABj/8AACAAAAAAAAAAAA/////////n//hgg/////////8AAAAAAAAAAAAAAAAAAAAAAADH/gAABAAAAAAAAAAAH////////+P//OAB/////////iAAAAAAAAAAAAAAAAAAAAAAAEP+AAAAAAAAAAAAAAA/////////4f//+AD////////8YAAAAAAAAAAAAAAAAAAAAAAAA/4AA3gAAAAAAAAAAD/////////x///8AH///7///8AAAAAAAAAAAAAAAAgAAAAAAAAB/wAABAAAAAAAAAAAf/////////n///wAf//4P//3AAAAAAAAAAAAAAAAAgAAAAAAAAH/AeADgAAAAAAAAAA/////////+P//+AAH//gf/+IAAAAAAAAAAAAAAAABAAAAAAAAAf+B4AAcAAAAAAAAAD/////////4f//wAAf/4A//xgAAAAAAAAAAAAAAAAAAAAAAAAAA/4PgAB8AAAAAAAAAP/////////w//+AAB//AD//GAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AGCAAAAAAAAAA//////////j//4AAH/4AH/8AAMAAAAAAAAAAAAAAAAAAAAAAAAA//wAAAAAAAAAAAAD/////////+H/+AAAf+AAf/4AAwAAAAAAAAAAAAAAAAAAAAAAAAAd+AAAAAAAAAAAAAP/////////8P/AAAA/wABv/wADAAAAAAAAAAAAAAAAAAAAAAAAAAB/4AAAAAAAAAAAB//////////4/4AAAD+AAAf/gAYAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAH//////////z+AAAAH4AAB/+AAgAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAAAAf//////////vAAAAAfgAAH/4AAwAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAB///////////AAAAAB+AAAZ/gAIAAAAAAAAAAAAAAAAAAAAAAAAAAADgAaAAAAAAAAAD//////////8AgAAAD4AAAj+AABAAAAAAAAAAAAAAAAAAAAAAAAAAAGAPcBAAAAAAAAD//////////5+AAAAPgAAEHwAIQAAAAAAAAAAAAAAAAAAAAAAAAAAAcA9/8AAAAAAAAP///////////wAAAAcAAAQGAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAb3//4AAAAAAAAf///////////AAAABkAABgAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ///wAAAAAAAB///////////8AAAAAYAACAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAD///////////gAAAABgAAEAAAE4AAAAAAAAAAAAAAAAAAAAAAAAAAAAP///AAAAAAAAD//n///////+AAAAAEAAAYAAYDAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAH/gP///////wAAAAAAAAh4ADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////wAAAAAAAEAAz//////+AAAAAAAABjgAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAAAH//////wAAAAAAAADOAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////AAAAAAAAAAAf/////+AAAAAAAAAOYA/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH////8AAAAAAAAAAB//////wAAAAAAAAAOwH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////wAAAAAAAAAAP/////+AAAAAAAAAA8B/8+IAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////AAAAAAAAAAA//////wAAAAAAAAAB4H/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////wAAAAAAAAAD/////+AAAAAAAAAAHgP8UAeAAAAAAAAAAAAAAAAAAAAAAAAAAD//////wAAAAAAAAAP/////wAAAAAAAAAAPA/zgAYwAAAAAAAAAAAAAAAAAAAAAAAAAH//////4AAAAAAAAAf////+AAAAAAAAAAAfD+PABn4AQAAAAAAAAAAAAAAAAAAAAAAA///////+AAAAAAAAA/////wAAAAAAAAAAA8AYcIB/8AQAAAAAAAAAAAAAAAAAAAAAAD///////8AAAAAAAAB/////AAAAAAAAAAABwABYAB/8CAAAAAAAAAAAAAAAAAAAAAAAP///////+AAAAAAAAH////4AAAAAAAAAAADAAEgAB/wIAAAAAAAAAAAAAAAAAAAAAAA////////4AAAAAAAAP////gAAAAAAAAAAAHAAAABD/wCAAAAAAAAAAAAAAAAAAAAAAB////////gAAAAAAAA/////AAAAAAAAAAAAP4AAAAP+ACAAAAAAAAAAAAAAAAAAAAAAD///////+AAAAAAAAB////8AAAAAAAAAAAAB8AgAB+OAAAAAAAAAAAAAAAAAAAAAAAAH///////4AAAAAAAAP////wAAAAAAAAAAAAAAAwAAYYAAAAAAAAAAAAAAAAAAAAAAAAf///////AAAAAAAAAf////AAAAAAAAAAAAAABEAAAA4AAAAAAAAAAAAAAAAAAAAAAAA///////4AAAAAAAAB////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////AAAAAAAAAH////4AAAAAAAAAAAAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAAAf////gCAAAAAAAAAAAAAAB/AgAAAAAAAAAAAAAAAAAAAAAAAAAf//////gAAAAAAAAD////+AMAAAAAAAAAAAAAAP4HAAAAAAAAAAAAAAAAAAAAAAAAAB//////+AAAAAAAAAP////4BwAAAAAAAAAAAAAM/geAAAAAAAAAAAAAAAAAAAAAAAAAB//////4AAAAAAAAB/////gPAAAAAAAAAAAAAD/+B4AAAEAAAAAAAAAAAAAAAAAAAAAD//////gAAAAAAAAH////8H4AAAAAAAAAAAAAf/+HwAAAAAAAAAAAAAAAAAAAAAAAAAD/////8AAAAAAAAAf////gfgAAAAAAAAAAAAD//+fAAAAAAAAAAAAAAAAAAAAAAAAAAH/////wAAAAAAAAB////4B+AAAAAAAAAAAAAP///8AAAAAEAAAAAAAAAAAAAAAAAAAAP/////AAAAAAAAAD////AH4AAAAAAAAAAAAB////4AAAAAAAAAAAAAAAAAAAAAAAAAA/////8AAAAAAAAAP///4AfAAAAAAAAAAAAAP////wAAAAAAAAAAAAAAAAAAAAAAAAAD/////gAAAAAAAAAf///gB8AAAAAAAAAAAAP/////gAAQAAAAAAAAAAAAAAAAAAAAAAP////+AAAAAAAAAB///+APwAAAAAAAAAAAD//////AAAgAAAAAAAAAAAAAAAAAAAAAA/////wAAAAAAAAAD///4A+AAAAAAAAAAAA///////AAAAAAAAAAAAAAAAAAAAAAAAAD////wAAAAAAAAAAP///gD4AAAAAAAAAAAD//////8AAAAAAAAAAAAAAAAAAAAAAAAAP///8AAAAAAAAAAA///+AHgAAAAAAAAAAAP//////4AAAAAAAAAAAAAAAAAAAAAAAAB////gAAAAAAAAAAD///gAIAAAAAAAAAAAAf//////wAAAAAAAAAAAAAAAAAAAAAAAAH///8AAAAAAAAAAAH//8AAAAAAAAAAAAAAD///////AAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAAAAAAAf//wAAAAAAAAAAAAAAP//////8AAAAAAAAAAAAAAAAAAAAAAAAB////AAAAAAAAAAAB///AAAAAAAAAAAAAAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAH///4AAAAAAAAAAAD//8AAAAAAAAAAAAAAB///////gAAAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAAAH//AAAAAAAAAAAAAAAD//////8AAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAf/8AAAAAAAAAAAAAAAP//////wAAAAAAAAAAAAAAAAAAAAAAAAP///gAAAAAAAAAAAA//gAAAAAAAAAAAAAAAf/+////AAAAAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAAAD/8AAAAAAAAAAAAAAAB/8Af//4AAAAAAAAAAAAAAAAAAAAAAAAD///gAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAP/AA///AAAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAAAAcAAAAAAAAAAAAAAAAA+AACf/8AAAAAAAAAAAAAAAAAAAAAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC//gAAAIAAAAAAAAAAAAAAAAAAAAH//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAQAAAAAAAAAAAAAAAAAAAAf//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAgAAAAAAAAAAAAAAAAAAAD//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAADQAAAAAAAAAAAAAAAAAAAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAAAAPAAAAAAAAAAAAAAAAAAAA//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAABwAAAAAAAAAAAAAAAAAAAAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAOAAAAAAAAAAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAABwAAAAAAAAAAAAAAAAAAAAX+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfwCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
  var LX, LY;                      /* longitude and latitude of every land cell */
  (function(){
    var raw = atob(MASK), n = GX * GY, xs = [], ys = [], i, b;
    for (i = 0; i < n; i++){
      b = raw.charCodeAt(i >> 3);
      if ((b >> (7 - (i & 7))) & 1){ xs.push(G0 + (i % GX + 0.5) * GS); ys.push(GT - ((i / GX) | 0) * GS - GS / 2); }
    }
    LX = new Float32Array(xs); LY = new Float32Array(ys);
  })();

  var HOME = { c:"SIN", lon:103.82, lat:1.35 };
  var DEST = [
    { n:"Bali, Canggu", c:"DPS", lon:115.13, lat:-8.65, t:"2h 45m", core:1,
      d:"Beach clubs, rice fields and villa mornings. Our most run route and the fastest to lock in.",
      img:"https://www.flycotravel.com/cdn/shop/files/FINNS-World-Best-Beach-Club-in-Canggu-Bali.jpg?v=1778752441&width=800" },
    { n:"Bangkok, Thailand", c:"BKK", lon:100.5, lat:13.75, t:"2h 20m", core:1,
      d:"Rooftops, markets and studio spaces. City energy that keeps filming well after dark.",
      img:"https://www.flycotravel.com/cdn/shop/files/image.jpg?v=1778815631&width=800" },
    { n:"Ho Chi Minh", c:"SGN", lon:106.7, lat:10.78, t:"2h 5m", core:1,
      d:"Colonial streets, cafe culture and courts. A different backdrop in every district.",
      img:"https://www.flycotravel.com/cdn/shop/files/Saigon_header_1.webp?v=1778814598&width=800" },
    { n:"Phuket, Thailand", c:"HKT", lon:98.39, lat:7.88, t:"1h 50m", core:1,
      d:"Island water, boats and beach clubs. The shortest flight for the biggest scenery.",
      img:"https://www.flycotravel.com/cdn/shop/files/Phuket-island-boat-tours.webp?v=1778815740&width=800" },
    { n:"Tokyo, Japan", c:"HND", lon:139.7, lat:35.69, t:"7h", core:0,
      d:"Long haul package. Neon streets, precision service and a backdrop that changes with the season.",
      img:FLYCO_IMG[0] },
    { n:"Shanghai, China", c:"PVG", lon:121.47, lat:31.23, t:"5h 30m", core:0,
      d:"Where our China lifestyle retreat ran. Skyline, old concessions and retail activations.",
      img:FLYCO_IMG[1] },
    { n:"Brisbane, Australia", c:"BNE", lon:153.03, lat:-27.47, t:"7h 45m", core:0,
      d:"Where the Sealy sleep retreat ran. Coastline, clean light and easy production days.",
      img:FLYCO_IMG[2] },
    { n:"Paris, France", c:"CDG", lon:2.35, lat:48.86, t:"13h 15m", core:0,
      d:"International package. Landmark backdrops and three months of usage rights.",
      img:FLYCO_IMG[3] },
    { n:"New York, USA", c:"JFK", lon:-74, lat:40.71, t:"18h 40m", core:0,
      d:"Where our finance creator retreat ran. The longest route our crew operates.",
      img:FLYCO_IMG[4] }
  ];

  var reduceM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, active = 0, touched = false, running = false, rafId = 0, t0 = 0;
  var view = { a:60, b:150, t:40, m:-30 }, from = null, to = null, tw = 1, twT0 = 0;

  function px(lon){ return (lon - view.a) / (view.b - view.a) * W; }
  function py(lat){ return (view.t - lat) / (view.t - view.m) * H; }
  function seen(d){ return d.lon > view.a && d.lon < view.b && d.lat < view.t && d.lat > view.m; }

  /* frame the route from Singapore to the chosen destination, respecting the stage aspect */
  function frameFor(d){
    var lo = Math.min(HOME.lon, d.lon), hi = Math.max(HOME.lon, d.lon),
        bo = Math.min(HOME.lat, d.lat), tp = Math.max(HOME.lat, d.lat),
        A = (W && H) ? W / H : 2.2, MIN = W < 620 ? 74 : 116, c, s;
    var padX = Math.max(10, (hi - lo) * 0.3), padY = Math.max(9, (tp - bo) * 0.42);
    lo -= padX; hi += padX; bo -= padY; tp += padY;
    if (hi - lo < MIN) { c = (lo + hi) / 2; lo = c - MIN / 2; hi = c + MIN / 2; }
    if ((hi - lo) / (tp - bo) < A) { c = (lo + hi) / 2; s = (tp - bo) * A; lo = c - s / 2; hi = c + s / 2; }
    else { c = (bo + tp) / 2; s = (hi - lo) / A; bo = c - s / 2; tp = c + s / 2; }
    /* keep the frame inside the mask */
    if (hi - lo >= G1 - G0) { lo = G0; hi = G1; }
    else if (lo < G0) { hi += G0 - lo; lo = G0; } else if (hi > G1) { lo -= hi - G1; hi = G1; }
    if (tp - bo >= GT - GB) { bo = GB; tp = GT; }
    else if (tp > GT) { bo -= tp - GT; tp = GT; } else if (bo < GB) { tp += GB - bo; bo = GB; }
    return { a:lo, b:hi, t:tp, m:bo };
  }
  function flyTo(v){
    if (reduceM || !W) { view = v; drawBase(); sync(); drawFx(0); return; }
    from = { a:view.a, b:view.b, t:view.t, m:view.m }; to = v; tw = 0; twT0 = 0;
    drawBase(v);
    if (!running) { t0 = 0; rafId = requestAnimationFrame(loop); running = true; }
  }
  function ease(x){ return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function colors(){
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark ? { dot:"rgba(255,255,255,.2)", arc:"rgba(255,255,255,.2)", bg:"#141312" }
                : { dot:"rgba(17,17,17,.2)", arc:"rgba(17,17,17,.17)", bg:"#fcfbf9" };
  }

  /* ---- pins ---- */
  var pinBox = document.getElementById("mapPins"), pins = [], homePin;
  function mkPin(label, cls){
    var b = document.createElement("button");
    b.type = "button"; b.className = "pin " + cls;
    b.innerHTML = "<i></i><b>" + label + "</b>";
    pinBox.appendChild(b);
    return b;
  }
  homePin = mkPin(HOME.c, "base");
  homePin.disabled = true; homePin.tabIndex = -1; homePin.setAttribute("aria-hidden", "true");
  DEST.forEach(function(d, i){
    var b = mkPin(d.n.split(",")[0], d.core ? "" : "sub");
    b.setAttribute("aria-label", "Show " + d.n);
    b.addEventListener("click", function(){ touched = true; select(i); });
    b.addEventListener("mouseenter", function(){ touched = true; select(i); });
    b.addEventListener("focus", function(){ touched = true; select(i); });
    pins.push(b);
  });

  /* ---- chips ---- */
  var chipBox = document.getElementById("mapChips"), chips = [];
  DEST.forEach(function(d, i){
    var b = document.createElement("button");
    b.type = "button"; b.textContent = d.n;
    b.addEventListener("click", function(){ touched = true; select(i); });
    chipBox.appendChild(b);
    chips.push(b);
  });

  /* ---- detail card ---- */
  var card = document.getElementById("mapCard"), mcImg = document.getElementById("mcImg"),
      mcCode = document.getElementById("mcCode"), mcTag = document.getElementById("mcTag"),
      mcName = document.getElementById("mcName"), mcDesc = document.getElementById("mcDesc"),
      mcTo = document.getElementById("mcTo"), mcTime = document.getElementById("mcTime");
  var now = document.getElementById("mapNow"), nowImg = document.getElementById("mnImg"),
      nowName = document.getElementById("mnName"), nowMeta = document.getElementById("mnMeta"), nowT = 0;

  function select(i){
    if (i === active && card.dataset.set) return;
    active = i; card.dataset.set = "1";
    var d = DEST[i];
    card.classList.toggle("noimg", !d.img);
    if (d.img) { mcImg.src = d.img; mcImg.alt = d.n; } else { mcImg.removeAttribute("src"); mcImg.alt = ""; }
    mcCode.textContent = d.c; mcTo.textContent = d.c;
    mcTime.textContent = d.t + " from Singapore";
    mcTag.textContent = d.core ? "Route we run monthly" : "Route on request";
    mcName.textContent = d.n; mcDesc.textContent = d.d;
    pins.forEach(function(p, k){ p.classList.toggle("on", k === i); });
    chips.forEach(function(c, k){ c.classList.toggle("on", k === i); });
    legStart = -1;                 /* the aircraft leaves Singapore again */
    now.classList.remove("on");
    if (nowT) clearTimeout(nowT);
    nowT = setTimeout(function(){
      nowName.textContent = d.n;
      nowMeta.textContent = d.c + " \u00b7 " + d.t + " from " + HOME.c;
      now.classList.toggle("has-img", !!d.img);
      if (d.img) nowImg.src = d.img; else nowImg.removeAttribute("src");
      now.classList.add("on");
    }, reduceM ? 0 : 170);
    flyTo(frameFor(d));
  }

  /* ---- layout and drawing ---- */
  function place(){
    var r = stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    [base, fx].forEach(function(c){
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    view = frameFor(DEST[active]); from = to = null; tw = 1;
    drawBase(); sync(); drawFx(0);
  }
  function sync(){
    homePin.style.left = px(HOME.lon) + "px"; homePin.style.top = py(HOME.lat) + "px";
    DEST.forEach(function(d, i){
      var vis = seen(d);
      pins[i].hidden = !vis;
      if (vis) { pins[i].style.left = px(d.lon) + "px"; pins[i].style.top = py(d.lat) + "px"; }
    });
  }
  var drawn = null;                /* the view the base layer is currently drawn for */
  function drawBase(v){
    v = v || view;
    var sx = W / (v.b - v.a), sy = H / (v.t - v.m),
        r = Math.max(0.85, Math.min(sx, sy) * GS * 0.34),
        d = r * 2, sq = r < 1.7, i, x, y;
    drawn = { a:v.a, b:v.b, t:v.t, m:v.m };
    base.style.transform = "";
    bctx.clearRect(0, 0, W, H);
    bctx.fillStyle = colors().dot;
    for (i = 0; i < LX.length; i++){
      if (LX[i] < v.a || LX[i] > v.b || LY[i] > v.t || LY[i] < v.m) continue;
      x = (LX[i] - v.a) * sx; y = (v.t - LY[i]) * sy;
      if (sq) { bctx.fillRect(x - r, y - r, d, d); }
      else { bctx.beginPath(); bctx.arc(x, y, r, 0, 6.2832); bctx.fill(); }
    }
  }
  /* while flying, slide and scale the drawn layer instead of redrawing it */
  function shiftBase(){
    if (!drawn) return;
    var k = (drawn.b - drawn.a) / (view.b - view.a);
    base.style.transformOrigin = "0 0";
    base.style.transform = "translate(" + px(drawn.a).toFixed(2) + "px," + py(drawn.t).toFixed(2) + "px) scale(" + k.toFixed(4) + ")";
  }
  function arcOf(d){
    var x0 = px(HOME.lon), y0 = py(HOME.lat), x1 = px(d.lon), y1 = py(d.lat),
        dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x0:x0, y0:y0, x1:x1, y1:y1,
             cx:(x0 + x1) / 2 + dy / len * len * 0.15, cy:(y0 + y1) / 2 - dx / len * len * 0.15 };
  }
  function bez(a, t){
    var u = 1 - t;
    return { x:u * u * a.x0 + 2 * u * t * a.cx + t * t * a.x1, y:u * u * a.y0 + 2 * u * t * a.cy + t * t * a.y1 };
  }
  /* half an aircraft, nose at +x; drawFx mirrors it to keep the shape symmetric */
  var PLANE = [[1,0],[.2,.15],[-.26,.14],[-.3,.66],[-.48,.66],[-.62,.13],[-.88,.12],[-.94,.42],[-1.04,.42],[-1.04,0]],
      legStart = -1, LEG = 2900;
  function plane(x, y, ang){
    var s = Math.max(9.5, Math.min(W, H) * 0.03), i;
    fctx.save();
    fctx.translate(x, y); fctx.rotate(ang); fctx.scale(s, s);
    fctx.beginPath();
    for (i = 0; i < PLANE.length; i++) fctx[i ? "lineTo" : "moveTo"](PLANE[i][0], PLANE[i][1]);
    for (i = PLANE.length - 1; i >= 0; i--) fctx.lineTo(PLANE[i][0], -PLANE[i][1]);
    fctx.closePath();
    /* outline in the stage colour first, so the shape reads against the route line */
    fctx.lineJoin = "round";
    fctx.strokeStyle = colors().bg; fctx.lineWidth = 2.8 / s;
    fctx.shadowColor = "rgba(0,0,0,.22)"; fctx.shadowBlur = 6 / s;
    fctx.stroke();
    fctx.shadowBlur = 0;
    fctx.fillStyle = "#c98f1f";
    fctx.fill();
    fctx.restore();
  }

  function drawFx(ms){
    var c = colors(), i, a, p, prog, pulse, rad, g, tail, nose;
    fctx.clearRect(0, 0, W, H);
    fctx.lineCap = "round";
    for (i = 0; i < DEST.length; i++){
      if (i === active || !seen(DEST[i])) continue;
      a = arcOf(DEST[i]);
      fctx.strokeStyle = c.arc; fctx.lineWidth = 1; fctx.setLineDash([2, 5]);
      fctx.beginPath(); fctx.moveTo(a.x0, a.y0); fctx.quadraticCurveTo(a.cx, a.cy, a.x1, a.y1); fctx.stroke();
    }
    fctx.setLineDash([]);
    if (!seen(DEST[active])) return;
    a = arcOf(DEST[active]);
    rad = Math.max(30, W * 0.06);
    pulse = reduceM ? .6 : .5 + Math.sin(ms / 620) * .16;
    g = fctx.createRadialGradient(a.x1, a.y1, 0, a.x1, a.y1, rad);
    g.addColorStop(0, "rgba(225,168,54," + (0.32 * pulse).toFixed(3) + ")");
    g.addColorStop(1, "rgba(225,168,54,0)");
    fctx.fillStyle = g;
    fctx.beginPath(); fctx.arc(a.x1, a.y1, rad, 0, 6.2832); fctx.fill();
    fctx.strokeStyle = "rgba(225,168,54,.9)"; fctx.lineWidth = 1.7;
    fctx.beginPath(); fctx.moveTo(a.x0, a.y0); fctx.quadraticCurveTo(a.cx, a.cy, a.x1, a.y1); fctx.stroke();
    if (reduceM) return;
    if (legStart < 0 || legStart > ms) legStart = ms;
    prog = ((ms - legStart) % LEG) / LEG;
    p = bez(a, prog); tail = bez(a, Math.max(0, prog - .09));
    fctx.strokeStyle = "rgba(225,168,54,.45)"; fctx.lineWidth = 2.4;
    fctx.beginPath(); fctx.moveTo(tail.x, tail.y); fctx.lineTo(p.x, p.y); fctx.stroke();
    nose = bez(a, Math.min(1, prog + .015));
    plane(p.x, p.y, Math.atan2(nose.y - p.y, nose.x - p.x));
  }

  function loop(ts){
    if (!t0) t0 = ts;
    if (to){
      if (!twT0) twT0 = ts;
      tw = Math.min((ts - twT0) / 850, 1);
      var e = ease(tw);
      view = { a:from.a + (to.a - from.a) * e, b:from.b + (to.b - from.b) * e,
               t:from.t + (to.t - from.t) * e, m:from.m + (to.m - from.m) * e };
      shiftBase(); sync();
      if (tw >= 1) { to = from = null; twT0 = 0; base.style.transform = ""; }
    }
    drawFx(ts - t0);
    rafId = requestAnimationFrame(loop);
  }
  function run(on){
    if (on === running) return;
    running = on;
    if (on) { t0 = 0; rafId = requestAnimationFrame(loop); }
    else { cancelAnimationFrame(rafId); drawFx(0); }
  }

  /* ---- auto tour until the visitor takes over ---- */
  /* order the hops near, far, next-near, next-far, so each leg crosses the map
     instead of creeping along neighbouring pins */
  function mins(t){
    var h = /(\d+)\s*h/.exec(t), m = /(\d+)\s*m/.exec(t);
    return (h ? +h[1] : 0) * 60 + (m ? +m[1] : 0);
  }
  var TOUR = [], tourAt = 0, tour = null;
  (function(){
    var byRange = DEST.map(function(_, i){ return i; })
                      .sort(function(a, b){ return mins(DEST[a].t) - mins(DEST[b].t); }),
        lo = 0, hi = byRange.length - 1;
    while (lo <= hi){ TOUR.push(byRange[lo++]); if (lo <= hi) TOUR.push(byRange[hi--]); }
  })();
  if (!reduceM) tour = setInterval(function(){
    if (touched || document.hidden || !running) return;
    tourAt = (tourAt + 1) % TOUR.length;
    select(TOUR[tourAt]);
  }, 5200);
  stage.addEventListener("mouseleave", function(){ touched = true; });
  chipBox.addEventListener("mouseenter", function(){ touched = true; });
  stage.addEventListener("touchstart", function(){ touched = true; }, { passive:true });

  place();
  select(0);
  tourAt = Math.max(0, TOUR.indexOf(0));
  if (window.ResizeObserver) new ResizeObserver(place).observe(stage);
  else window.addEventListener("resize", place);
  new MutationObserver(function(){ drawBase(); drawFx(0); })
    .observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
  if ("IntersectionObserver" in window && !reduceM){
    new IntersectionObserver(function(en){ run(en[0].isIntersecting); }, { threshold:0.12 }).observe(stage);
  }
})();

})();
