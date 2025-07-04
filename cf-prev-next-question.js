// ==UserScript==
// @name         Codeforces – Prev/Next Problem Buttons
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Codeforces’ta hem önceki hem de sonraki problem sayfasına hızlı geçiş butonları ekler.
// @author       Siz
// @match        https://codeforces.com/contest/*/problem/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  // URL’den contest ID ve problem harfini al
  const match = window.location.pathname.match(/\/contest\/(\d+)\/problem\/([A-Za-z]+)/);
  if (!match) return;

  const contestId = match[1];
  const problemLetter = match[2].toUpperCase();
  const code = problemLetter.charCodeAt(0);

  // Önceki ve sonraki harfleri hesapla
  const prevLetter = code > 65 ? String.fromCharCode(code - 1) : null;
  const nextLetter = code < 90 ? String.fromCharCode(code + 1) : null;

  // Ortak buton stili fonksiyonu
  function createButton(label, title, href, offsetRight) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.title = title;
    btn.style.position = 'fixed';
    btn.style.top = '100px';
    btn.style.right = `${offsetRight}px`;
    btn.style.zIndex = '1000';
    btn.style.padding = '8px 12px';
    btn.style.fontSize = '14px';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.background = '#008CBA';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      window.location.href = href;
    });
    document.body.appendChild(btn);
  }

  // Önceki problem butonu
  if (prevLetter) {
    const prevUrl = `https://codeforces.com/contest/${contestId}/problem/${prevLetter}`;
    createButton(`← ${prevLetter}`, `Önceki problem: ${prevLetter}`, prevUrl, 120);
  }

  // Sonraki problem butonu
  if (nextLetter) {
    const nextUrl = `https://codeforces.com/contest/${contestId}/problem/${nextLetter}`;
    createButton(`${nextLetter} →`, `Sonraki problem: ${nextLetter}`, nextUrl, 20);
  }
})();
