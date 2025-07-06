// ==UserScript==
// @name         Codeforces Statement
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Codeforces arayüzünü geliştirir, statement ve profil sayfasını daha okunabilir hale getirir
// @author       ChatGPT
// @match        https://codeforces.com/*
// @match        https://*.codeforces.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const style = `
        /* Accepted / Rejected satır renklendirme */
        .status-frame-datatable tr {
            transition: background-color 0.3s ease;
        }

        .status-frame-datatable tr[data-submission-id] td {
            color: black !important;
        }

        .status-frame-datatable tr[data-submission-id] td:nth-child(6) {
            background-color: #f8a1a1 !important;
        }

        .status-frame-datatable tr[data-submission-id] td:nth-child(6):has(.verdict-accepted),
        .status-frame-datatable tr[data-submission-id] td.verdict-accepted {
            background-color: #a8f0a1 !important;
        }

        /* Problem statement güzelleştirme */
        .problem-statement {
            font-family: 'Segoe UI', sans-serif !important;
            font-size: 16px;
            line-height: 1.6;
            background-color: #ffffff !important;
            color: #222 !important;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .problem-statement .section-title,
        .problem-statement h2,
        .problem-statement h3 {
            color: #005cc5 !important;
            margin-top: 24px;
        }

        .problem-statement pre,
        .problem-statement code {
            background: #f4f4f4 !important;
            color: #333 !important;
            padding: 10px;
            border-radius: 6px;
            font-size: 15px;
            font-family: Consolas, monospace;
            overflow-x: auto;
        }

        .sample-test {
            margin-top: 20px;
        }

        .input pre,
        .output pre {
            background: #eaf3ff !important;
            border: 1px solid #c3dafe;
        }

        .header .title {
            font-size: 28px !important;
            font-weight: bold;
        }

        /* Profil sayfası stil iyileştirmesi */
        .userbox {
            background-color: #f9f9ff !important;
            border: 1px solid #d0d7de;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }

        .userbox .title-photo {
            font-size: 26px;
            font-weight: bold;
            color: #005cc5;
            margin-bottom: 10px;
        }

        .userbox .info {
            font-family: 'Segoe UI', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
        }

        .userbox .info li {
            margin-bottom: 8px;
        }

        .userbox .info ul {
            padding-left: 20px;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.innerText = style;
    document.head.appendChild(styleElement);

    const observer = new MutationObserver(() => {
        document.querySelectorAll('.status-frame-datatable tr[data-submission-id]').forEach(row => {
            const verdictCell = row.querySelector('td:nth-child(6)');
            if (verdictCell) {
                const text = verdictCell.innerText.trim().toLowerCase();
                if (text.includes('accepted')) {
                    row.style.backgroundColor = '#a8f0a1';
                    row.style.color = 'black';
                } else {
                    row.style.backgroundColor = '#f8a1a1';
                    row.style.color = 'black';
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
