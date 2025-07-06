// ==UserScript==
// @name         Codeforces Profile
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  Profil kısmını düzenler, rating grafiği ve günlük aktiviteleri yan yana gösterir
// @author       ChatGPT
// @match        https://codeforces.com/profile/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Temel stiller
    const style = `
        .userbox {
            background: #f4f9ff;
            border-radius: 12px;
            border: 1px solid #d0e4f1;
            padding: 20px;
            margin: 20px auto;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            max-width: 90%;
            text-align: center;
            position: relative;
        }
        .userbox > .title-photo {
            font-size: 32px;
            font-weight: bold;
            color: #004b9d;
            margin-bottom: 12px;
            position: relative;
            z-index: 2;
        }
        .userbox > .title-photo::after {
            content: attr(data-handle);
            position: absolute;
            top: 0;
            left: 0;
            color: rgba(0,0,0,0);
            font-size: 32px;
            font-weight: bold;
            display: none;
            z-index: 1;
            pointer-events: none;
        }
        .userbox > .title-photo.empty::after {
            display: block;
        }
        .userbox > .user-rank {
            font-size: 20px;
            font-weight: 500;
            color: #00743f;
            margin-bottom: 24px;
        }
        .userbox .info ul {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 0;
            margin: 0 0 24px;
            list-style: none;
            width: 100%;
            box-sizing: border-box;
        }
        .userbox .info li {
            background: #e7f3ff;
            padding: 8px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            word-break: break-word;
            text-align: center;
        }
        .userbox .medals-holder {
            margin-top: 12px;
        }
        .userbox .medals-container {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
            background: #ffffff;
            border: 1px solid #d0e4f1;
            padding: 8px;
            border-radius: 8px;
        }
        .userbox .medals-container img {
            width: 32px;
            height: 32px;
        }
        /* Flex container for graph and calendar */
        .graph-calendar-container {
            display: flex;
            gap: 20px;
            margin: 20px auto;
            max-width: 90%;
        }
        .graph-calendar-container > div {
            flex: 1;
            width: 50%;
            box-sizing: border-box;
        }
        @media screen and (max-width: 900px) {
            .graph-calendar-container { flex-direction: column; }
        }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    document.head.appendChild(styleEl);

    function enhanceProfile() {
        // userbox işlemleri
        const userbox = document.querySelector('.userbox');
        if (!userbox) return;

        const titleEl = userbox.querySelector(':scope > .title-photo');
        const handle = window.location.pathname.split('/').pop();
        titleEl.setAttribute('data-handle', handle);
        titleEl.classList.toggle('empty', !titleEl.textContent.trim());

        // madalya işlemleri
        if (!userbox.querySelector('.medals-holder')) {
            const allImgs = Array.from(document.querySelectorAll('img'));
            const medals = allImgs.filter(img =>
                (img.title && /honor/i.test(img.title)) ||
                (img.alt && /honor/i.test(img.alt))
            );
            const photoDiv = document.querySelector('.title-photo ~ div img[src*="userphoto"]')?.closest('div');
            if (medals.length && photoDiv && photoDiv.closest('.userbox') === userbox) {
                const holder = document.createElement('div');
                holder.className = 'medals-holder';
                const container = document.createElement('div');
                container.className = 'medals-container';
                medals.forEach(img => container.appendChild(img.cloneNode(true)));
                holder.appendChild(container);
                photoDiv.insertAdjacentElement('afterend', holder);
            }
        }

        // rating grafiği ve günlük aktiviteleri yan yana yerleştir
        // Seçiciler Codeforces DOM öğelerine uyarlanmalı
        const chart = document.getElementById('chart') || document.querySelector('.rating-graph');
        const calendar = document.querySelector('.calendar-graph') || document.querySelector('.profile-calendar');
        if (chart && calendar && !document.querySelector('.graph-calendar-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'graph-calendar-container';
            // chart ve calendar öğelerini sarmala taşı
            chart.parentNode.insertBefore(wrapper, chart);
            wrapper.appendChild(chart);
            wrapper.appendChild(calendar);
        }
    }

    const observer = new MutationObserver(enhanceProfile);
    observer.observe(document.body, { childList: true, subtree: true });
    enhanceProfile();
})();
