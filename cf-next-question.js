// ==UserScript==
// @name         Codeforces – Next Problem Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Codeforces’ta problem A’daysanız bir “Sonraki Problem” butonu ekler, B’ye atlar vb.
// @author       Siz
// @match        https://codeforces.com/contest/*/problem/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  // URL’den contest ID ve problem harfini çıkart
  const match = window.location.pathname.match(/\/contest\/(\d+)\/problem\/([A-Za-z]+)/);
  if (!match) return;

  const contestId = match[1];
  const problemLetter = match[2].toUpperCase();

  // Bir sonraki harfi hesapla: A->B, B->C, ...
  const nextCode = problemLetter.charCodeAt(0) + 1;
  // Z’den sonrası için çıkış yap
  if (nextCode > 'Z'.charCodeAt(0)) return;
  const nextLetter = String.fromCharCode(nextCode);

  // Hedef URL
  const nextUrl = `https://codeforces.com/contest/${contestId}/problem/${nextLetter}`;

  // Butonu oluştur
  const btn = document.createElement('button');
  btn.textContent = `⇢ Problem ${nextLetter}`;
  btn.style.position = 'fixed';
  btn.style.top = '100px';
  btn.style.right = '20px';
  btn.style.zIndex = '1000';
  btn.style.padding = '8px 12px';
  btn.style.fontSize = '14px';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.background = '#008CBA';
  btn.style.color = 'white';
  btn.style.cursor = 'pointer';
  btn.title = `Bir sonraki problem: ${nextLetter}`;

  // Butona tıklandığında yönlendir
  btn.addEventListener('click', () => {
    window.location.href = nextUrl;
  });

  document.body.appendChild(btn);
})();
