'use strict';

const cover = document.querySelector('#cover');
const main = document.querySelector('main');
const music = document.querySelector('#music');
const opener = document.querySelector('#open');
const skip = document.querySelector('#skip');
const musicButtons = [document.querySelector('#music-toggle'), document.querySelector('#reply-music')];
const prefersStill = matchMedia('(prefers-reduced-motion: reduce)');
let stage = 'sealed';
let openingTimer;

function showCard(focusHeading = true) {
  clearTimeout(openingTimer);
  stage = 'open';
  cover.hidden = true;
  cover.classList.remove('opening');
  document.body.classList.remove('sealed');
  skip.hidden = true;
  main.inert = false;
  musicButtons[0].hidden = false;
  if (focusHeading) document.querySelector('#couple').focus({preventScroll: true});
}

function closeCard(focusSeal = false) {
  clearTimeout(openingTimer);
  stage = 'sealed';
  main.inert = true;
  music.pause();
  music.currentTime = 0;
  musicButtons[0].hidden = true;
  opener.disabled = false;
  cover.hidden = false;
  skip.hidden = true;
  cover.classList.remove('opening');
  document.body.classList.add('sealed');
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({top: 0, behavior: 'instant'});
  if (focusSeal) opener.focus({preventScroll: true});
}

function syncMusic() {
  const playing = !music.paused && !music.ended;
  const action = playing ? 'Pause music' : 'Play music';
  for (const button of musicButtons) {
    button.setAttribute('aria-label', action);
    button.setAttribute('aria-pressed', String(playing));
    button.querySelector('use').setAttribute('href', '../assets/card-icons.svg#' + (playing ? 'pause' : 'play'));
  }
}

function playMusic() { music.play().catch(syncMusic); }
for (const button of musicButtons) {
  button.addEventListener('click', () => { if (music.paused) playMusic(); else music.pause(); });
}
for (const event of ['play','pause','ended','error']) music.addEventListener(event, syncMusic);
window.addEventListener('pagehide', () => music.pause());

opener.addEventListener('click', () => {
  if (stage !== 'sealed') return;
  stage = 'opening';
  playMusic();
  if (prefersStill.matches) { showCard(); return; }
  opener.disabled = true;
  cover.classList.add('opening');
  skip.hidden = false;
  // Keep the card usable if the browser interrupts a background-tab animation.
  openingTimer = setTimeout(showCard, 8300);
});
cover.addEventListener('animationend', event => {
  if (stage === 'opening' && event.target === cover && event.animationName === 'unseal-finish') showCard();
});
skip.addEventListener('click', () => showCard());
document.querySelector('#replay').addEventListener('click', () => closeCard(true));

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const target = location.hash && document.getElementById(location.hash.slice(1));
if (target && main.contains(target)) {
  showCard(false);
  requestAnimationFrame(() => target.scrollIntoView({behavior: 'instant'}));
} else {
  closeCard();
}

const countdown = document.querySelector('#countdown');
const digits = [...countdown.querySelectorAll('.clock b')];
const start = Date.parse('2026-12-26T12:30:00+05:00');
function tick() {
  let seconds = Math.max(0, Math.floor((start - Date.now()) / 1000));
  countdown.hidden = seconds === 0;
  [86400,3600,60,1].forEach((unit,i) => {
    digits[i].textContent = String(Math.floor(seconds / unit)).padStart(2,'0');
    seconds %= unit;
  });
}
tick();
setInterval(tick, 1000);

const timeline = document.querySelector('.timeline');
let queued = false;
function trackSchedule() {
  const rect = timeline.getBoundingClientRect();
  const position = Math.min(1, Math.max(0, (innerHeight * .52 - rect.top) / rect.height));
  timeline.style.setProperty('--position', position.toFixed(3));
  queued = false;
}
window.addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(trackSchedule); }
}, {passive:true});
trackSchedule();

const reply = document.querySelector('#reply');
const form = document.querySelector('#reply-form');
const guestCount = form.elements.count;
document.querySelector('#open-rsvp').addEventListener('click', event => {
  if (typeof reply.showModal !== 'function') return;
  event.preventDefault();
  reply.showModal();
  document.querySelector('#close-rsvp').focus();
});
document.querySelector('#close-rsvp').addEventListener('click', () => reply.close());
form.addEventListener('change', () => {
  guestCount.disabled = form.elements.attending.value === 'no';
  if (guestCount.disabled) guestCount.value = '0';
  else if (guestCount.value === '0') guestCount.value = '1';
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const guest = form.elements.guest.value.trim();
  if (!guest) { form.elements.guest.focus(); return; }
  const coming = form.elements.attending.value === 'yes';
  const response = coming ? 'Accepts with pleasure. Guests attending: ' + guestCount.value : 'Declines with regret.';
  const message = 'Rukhsati RSVP for Mussadiq & Unmber · 26 December 2026\n' + guest + ' — ' + response;
  window.location.assign('https://wa.me/923416203644?text=' + encodeURIComponent(message));
});
