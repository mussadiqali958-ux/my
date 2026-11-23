'use strict';

const cover = document.querySelector('#cover');
const openButton = document.querySelector('#open');
const invitation = document.querySelector('#invitation');
const music = document.querySelector('#music');
const musicToggle = document.querySelector('#music-toggle');
const replay = document.querySelector('#replay');
const mapToggle = document.querySelector('#map-toggle');
const venueMap = document.querySelector('#venue-map');
const countdown = document.querySelector('#countdown');
const units = [...countdown.querySelectorAll('[data-unit]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const start = Date.parse('2026-12-26T12:30:00+05:00');
let opening = false;
let countdownTimer;

function syncMusicButton() {
  musicToggle.setAttribute('aria-pressed', String(!music.paused));
  musicToggle.setAttribute('aria-label', music.paused ? 'Play music' : 'Pause music');
}

function playMusic() {
  music.play()?.catch(syncMusicButton);
}

function updateCountdown() {
  let remaining = Math.ceil((start - Date.now()) / 1000);
  countdown.hidden = remaining <= 0;
  if (countdown.hidden) {
    clearInterval(countdownTimer);
    return;
  }
  [86400, 3600, 60, 1].forEach((period, index) => {
    units[index].textContent = String(Math.floor(remaining / period)).padStart(2, '0');
    remaining %= period;
  });
}

function showCard() {
  cover.hidden = true;
  cover.classList.remove('opening');
  document.body.classList.remove('sealed');
  invitation.inert = false;
  musicToggle.hidden = false;
  replay.hidden = false;
  opening = false;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function showCover() {
  clearInterval(countdownTimer);
  invitation.inert = true;
  document.body.classList.add('sealed');
  cover.hidden = false;
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

openButton.addEventListener('click', async () => {
  if (opening) return;
  opening = true;
  playMusic();
  if (!reducedMotion.matches) {
    cover.classList.add('opening');
    const animation = cover.getAnimations?.().find(item => item.animationName === 'cover-reveal');
    await animation?.finished.catch(() => {});
  }
  showCard();
  document.querySelector('#couple').focus({ preventScroll: true });
});

replay.addEventListener('click', () => {
  music.pause();
  music.currentTime = 0;
  showCover();
  openButton.focus({ preventScroll: true });
});

musicToggle.addEventListener('click', () => {
  if (music.paused) playMusic();
  else music.pause();
});
mapToggle.hidden = false;
mapToggle.addEventListener('click', () => {
  const showing = venueMap.hidden;
  if (showing && !venueMap.firstElementChild) {
    const frame = document.createElement('iframe');
    frame.title = 'Map of Raya Orchard Marquee';
    frame.src = 'https://maps.google.com/maps?q=32.1816308,74.1478745&z=16&output=embed';
    venueMap.append(frame);
  }
  venueMap.hidden = !showing;
  mapToggle.setAttribute('aria-expanded', String(showing));
  mapToggle.textContent = showing ? 'Hide map' : 'Preview map';
});
for (const event of ['play', 'pause', 'error']) music.addEventListener(event, syncMusicButton);
window.addEventListener('pagehide', () => music.pause());
syncMusicButton();

const section = document.getElementById(location.hash.slice(1));
if (section && invitation.contains(section)) showCard();
else showCover();
