// ==UserScript==
// @name         Codeforces – Prev/Next & Problemset-to-Contest Link
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  1) Contest sayfalarında önceki/sonraki problem butonları ekler; 2) Problemset sayfalarında "Contest Link" butonu ekleyerek ilgili contest problemine geçiş sağlar.
// @author       Siz
// @match        https://codeforces.com/contest/*/problem/*
// @match        https://codeforces.com/problemset/problem/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  const path = window.location.pathname;

  // 1) Contest sayfası için Prev/Next butonları
  const contestMatch = path.match(/^\/contest\/(\d+)\/problem\/([A-Za-z]+)/);
  if (contestMatch) {
    const contestId = contestMatch[1];
    const problemLetter = contestMatch[2].toUpperCase();
    const code = problemLetter.charCodeAt(0);
    const prevLetter = code > 65 ? String.fromCharCode(code - 1) : null;
    const nextLetter = code < 90 ? String.fromCharCode(code + 1) : null;

    function createButton(label, title, href, offsetRight) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.title = title;
      Object.assign(btn.style, {
        position: 'fixed', top: '100px', right: `${offsetRight}px`,
        zIndex: '1000', padding: '8px 12px', fontSize: '14px',
        border: 'none', borderRadius: '4px', background: '#008CBA',
        color: 'white', cursor: 'pointer'
      });
      btn.addEventListener('click', () => window.location.href = href);
      document.body.appendChild(btn);
    }

    const tryUrl = (letter) => `https://codeforces.com/contest/${contestId}/problem/${letter}`;
    if (prevLetter) fetch(tryUrl(prevLetter), {method:'HEAD'}).then(r=>r.ok&&createButton(`← ${prevLetter}`, `Önceki: ${prevLetter}`, tryUrl(prevLetter), 120));
    if (nextLetter) fetch(tryUrl(nextLetter), {method:'HEAD'}).then(r=>r.ok&&createButton(`${nextLetter} →`, `Sonraki: ${nextLetter}`, tryUrl(nextLetter), 20));
    return;
  }

  // 2) Problemset sayfası için Contest Link butonu
  const psMatch = path.match(/^\/problemset\/problem\/(\d+)\/([A-Za-z]+)/);
  if (psMatch) {
    const contestId = psMatch[1];
    const problemLetter = psMatch[2].toUpperCase();
    const contestUrl = `https://codeforces.com/contest/${contestId}/problem/${problemLetter}`;

    // Buton oluştur
    const btn = document.createElement('button');
    btn.textContent = 'Contest Link';
    btn.title = `Kontest sayfasına git: ${contestId} ${problemLetter}`;
    Object.assign(btn.style, {
      position: 'fixed', top: '100px', right: '20px',
      zIndex: '1000', padding: '8px 12px', fontSize: '14px',
      border: 'none', borderRadius: '4px', background: '#28A745',
      color: 'white', cursor: 'pointer'
    });
    btn.addEventListener('click', () => window.location.href = contestUrl);
    document.body.appendChild(btn);
  }
})();
