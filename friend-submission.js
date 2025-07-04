// ==UserScript==
// @name         Friend Submissions Viewer (Contest, Problemset, Gym)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Shows friends' submissions in contest, problemset and gym problems with styled modal and button bottom-right.
// @author       
// @match        https://codeforces.com/contest/*/problem/*
// @match        https://codeforces.com/problemset/problem/*/*
// @match        https://codeforces.com/gym/*/problem/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const friendHandles = ['AzeTurk810', 'tooourist', 'Osman_112', 'Mendeke', 'ruslan_211', 'Raul2008487', 'TheSahib', 'dmraykhan', 'Okahak71', 'mamikonm1', 'ElayV1313', 'AtillaMA', 'BakhtiyarN', 'Hasanv', 'ElayV131313', 'Ayxan007', 'OkaTree71', 'I999Q'];

    const pathParts = window.location.pathname.split('/').filter(Boolean);

    let contestId, problemIndex;

    if (pathParts[0] === 'contest') {
        contestId = pathParts[1];
        problemIndex = pathParts[3];
    } else if (pathParts[0] === 'problemset') {
        contestId = pathParts[2];
        problemIndex = pathParts[3];
    } else if (pathParts[0] === 'gym') {
        contestId = pathParts[1];
        problemIndex = pathParts[3];
    } else {
        console.error('Unsupported URL for Friend Submissions Viewer.');
        return;
    }

    const btn = document.createElement('button');
    btn.innerText = 'View Friend Submissions';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '10px 16px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: '1px solid #007bff',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        fontFamily: 'Verdana, sans-serif',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        transform: 'scale(1)'
    });
    btn.onmouseenter = () => {
        btn.style.backgroundColor = '#0056b3';
        btn.style.borderColor = '#0056b3';
        btn.style.transform = 'scale(1.05)';
    };
    btn.onmouseleave = () => {
        btn.style.backgroundColor = '#007bff';
        btn.style.borderColor = '#007bff';
        btn.style.transform = 'scale(1)';
    };
    btn.onclick = showFriendSubmissions;
    document.body.appendChild(btn);

    const backdrop = document.createElement('div');
    Object.assign(backdrop.style, {
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9998, display: 'none'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '20px',
        zIndex: 9999,
        maxHeight: '80vh',
        overflowY: 'auto',
        width: '600px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        display: 'none',
        fontFamily: 'Verdana, sans-serif',
        fontSize: '13px'
    });

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '✖';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '10px',
        right: '15px',
        cursor: 'pointer',
        fontSize: '18px',
        color: '#888'
    });
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    };
    modal.appendChild(closeBtn);

    const contentDiv = document.createElement('div');
    modal.appendChild(contentDiv);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    async function showFriendSubmissions() {
        contentDiv.innerHTML = '<p><b>Loading submissions...</b></p>';
        modal.style.display = 'block';
        backdrop.style.display = 'block';

        let htmlContent = '';
        for (const handle of friendHandles) {
            const url = `https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.status === "OK") {
                    const submissions = data.result
                        .filter(sub => sub.problem.index === problemIndex)
                        .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);
                    if (submissions.length > 0) {
                        htmlContent += renderStyledSubmissions(handle, submissions);
                    }
                } else {
                    htmlContent += `<p>⚠️ ${handle}: API error (${data.comment})</p>`;
                }
            } catch (error) {
                htmlContent += `<p>❌ ${handle}: Failed to load submissions.</p>`;
                console.error(error);
            }
        }

        contentDiv.innerHTML = htmlContent || "<p><i>No submissions found.</i></p>";
    }

    function verdictIconAndTest(sub) {
        const verdict = sub.verdict;
        const passed = sub.passedTestCount;
        if (verdict === "OK") return '✅ Accepted';
        if (!passed && verdict !== "OK") return `❌ ${verdict}`;
        return `❌ ${verdict} (Failed on test #${passed + 1})`;
    }

    function renderStyledSubmissions(handle, submissions) {
        let html = `<div style="margin-bottom:16px;"><h3>👤 ${handle}</h3><table style="width:100%; border-collapse: collapse;">`;
        html += `
            <tr style="background:#f2f2f2;">
                <th align="left" style="padding:6px;">Verdict</th>
                <th align="left" style="padding:6px;">Language</th>
                <th align="left" style="padding:6px;">Time</th>
                <th align="left" style="padding:6px;">Memory</th>
                <th></th>
            </tr>`;
        submissions.forEach(sub => {
            const verdict = verdictIconAndTest(sub);
            const lang = sub.programmingLanguage;
            const time = sub.timeConsumedMillis + ' ms';
            const memory = sub.memoryConsumedBytes ? Math.round(sub.memoryConsumedBytes / 1024) + ' KB' : '-';
            const link = `https://codeforces.com/contest/${contestId}/submission/${sub.id}`;
            html += `
                <tr style="border-top: 1px solid #ddd;">
                    <td style="padding:6px;">${verdict}</td>
                    <td style="padding:6px;">${lang}</td>
                    <td style="padding:6px;">${time}</td>
                    <td style="padding:6px;">${memory}</td>
                    <td style="padding:6px;"><a href="${link}" target="_blank">Show Code</a></td>
                </tr>`;
        });
        html += '</table></div>';
        return html;
    }

})();
