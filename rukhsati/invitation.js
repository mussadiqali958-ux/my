'use strict';

const cover = document.querySelector('#cover');
const main = document.querySelector('main');
const film = document.querySelector('#opening-film');
const music = document.querySelector('#music');
const opener = document.querySelector('#open');
const musicButtons = [...document.querySelectorAll('.music')];
const prefersStill = matchMedia('(prefers-reduced-motion: reduce)');
let opening = false;
let fallbackTimer;
let completed = false;

function showInvitation() {
  if (completed) return;
  completed = true;
  clearTimeout(fallbackTimer);
  cover.classList.add('reveal');
  main.inert = false;
  document.body.classList.remove('sealed');
  musicButtons[0].hidden = false;
  setTimeout(() => {
    cover.hidden = true;
    film.pause();
    document.querySelector('#couple').focus({preventScroll: true});
  }, prefersStill.matches ? 0 : 620);
}

function syncMusic() {
  for (const button of musicButtons) {
    button.classList.toggle('playing', !music.paused);
    button.setAttribute('aria-label', music.paused ? 'Play music' : 'Pause music');
  }
}

function playMusic() { music.play().catch(syncMusic); }
for (const button of musicButtons) {
  button.addEventListener('click', () => { if (music.paused) playMusic(); else music.pause(); });
}
for (const event of ['play','pause','error']) music.addEventListener(event, syncMusic);
window.addEventListener('pagehide', () => music.pause());

opener.addEventListener('click', () => {
  if (opening) return;
  opening = true;
  playMusic();
  if (prefersStill.matches) { showInvitation(); return; }
  fallbackTimer = setTimeout(showInvitation, 9200);
  film.play().catch(showInvitation);
});
film.addEventListener('ended', showInvitation);
film.addEventListener('error', () => { if (opening) showInvitation(); });

if (location.hash && document.getElementById(location.hash.slice(1))) {
  musicButtons[0].hidden = false;
} else {
  document.body.classList.add('sealed');
  cover.hidden = false;
  main.inert = true;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo({top:0,behavior:'instant'});
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
