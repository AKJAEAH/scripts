// ==UserScript==
// @name         CF Find Question
// @namespace    http://yourdomain.com/
// @version      1.7
// @description  Shows problems your friends solved but you haven't, filtered by rating and tags, draggable panel with minimize button
// @match        *://codeforces.com/*
// @match        *://*.codeforces.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    setTimeout(() => {
        console.log("⏳ Delayed script started");

        const panel = document.createElement("div");
        panel.id = "cf-panel";
        panel.style.position = "fixed";
        panel.style.top = "20px";
        panel.style.left = "20px";  // Sağ yerine solda
        panel.style.width = "120px";  // Küçültülmüş genişlik ile başla
        panel.style.height = "40px";  // Küçültülmüş yükseklik ile başla
        panel.style.background = "#f9f9f9";
        panel.style.border = "2px solid #333";
        panel.style.padding = "6px";  // Küçük hal için az padding
        panel.style.zIndex = "10000";
        panel.style.fontFamily = "Arial, sans-serif";
        panel.style.boxShadow = "0 0 12px rgba(0,0,0,0.25)";
        panel.style.borderRadius = "8px";
        panel.style.overflow = "hidden"; // Küçükken taşmaları gizle

        panel.innerHTML = `
            <div id="cf-header" style="cursor:move; display:flex; justify-content:space-between; align-items:center; margin-bottom:0;">
                <h3 style="margin:0; font-weight:bold; color:#222; font-size:16px; flex-grow:1;">👥 CF Find Question</h3>
                <button id="cf-toggle" style="background:none; border:none; font-size:22px; font-weight:bold; cursor:pointer; user-select:none; width:32px; height:32px; line-height:22px; padding:0;">+</button>
            </div>
            <div id="cf-body" style="display:none; margin-top:10px;">
                <label for="cf-your-handle" style="font-weight:bold;">Your handle:</label><br>
                <input id="cf-your-handle" style="width:100%; padding:6px; margin-bottom:12px; border:1px solid #ccc; border-radius:4px;" placeholder="e.g. my_handle"><br>

                <label for="cf-friends" style="font-weight:bold;">Friends' handles (comma separated):</label><br>
                <input id="cf-friends" style="width:100%; padding:6px; margin-bottom:12px; border:1px solid #ccc; border-radius:4px;" placeholder="e.g. alice,bob,charlie"><br>

                <label for="cf-min-rating" style="font-weight:bold;">Minimum rating:</label><br>
                <input id="cf-min-rating" type="number" style="width:100%; padding:6px; margin-bottom:12px; border:1px solid #ccc; border-radius:4px;" placeholder="e.g. 1000"><br>

                <label for="cf-max-rating" style="font-weight:bold;">Maximum rating:</label><br>
                <input id="cf-max-rating" type="number" style="width:100%; padding:6px; margin-bottom:12px; border:1px solid #ccc; border-radius:4px;" placeholder="e.g. 1500"><br>

                <label for="cf-tags" style="font-weight:bold;">Tags (comma separated, must have all):</label><br>
                <input id="cf-tags" style="width:100%; padding:6px; margin-bottom:12px; border:1px solid #ccc; border-radius:4px;" placeholder="e.g. dp,math"><br>

                <button id="cf-check" style="width:100%; padding:8px; background:#0078d7; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer; font-size:14px;">Compare</button>
                <button id="cf-reset" style="width:100%; padding:8px; margin-top:6px; background:#777; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer; font-size:14px;">Reset</button>

                <div id="cf-result" style="margin-top:15px; max-height:300px; overflow-y:auto; font-size:14px; color:#333;"></div>
            </div>
        `;
        document.body.appendChild(panel);

        // Küçültme/Genisletme butonu
        const toggleBtn = document.getElementById("cf-toggle");
        const bodyDiv = document.getElementById("cf-body");
        let minimized = true; // başlangıçta küçük

        toggleBtn.onclick = () => {
            minimized = !minimized;
            if (minimized) {
                bodyDiv.style.display = "none";
                panel.style.width = "120px";
                panel.style.height = "40px";
                toggleBtn.textContent = "+";
                panel.style.padding = "6px";
                panel.style.overflow = "hidden";
            } else {
                bodyDiv.style.display = "block";
                panel.style.width = "420px";
                panel.style.height = "auto";
                toggleBtn.textContent = "−";
                panel.style.padding = "15px";
                panel.style.overflow = "visible";
            }
        };

        // Reset butonu
        document.getElementById("cf-reset").onclick = () => {
            document.getElementById("cf-your-handle").value = "";
            document.getElementById("cf-friends").value = "";
            document.getElementById("cf-min-rating").value = "";
            document.getElementById("cf-max-rating").value = "";
            document.getElementById("cf-tags").value = "";
            document.getElementById("cf-result").innerHTML = "";
        };

        // Compare butonu işlemi
        document.getElementById("cf-check").onclick = async () => {
            const yourHandle = document.getElementById("cf-your-handle").value.trim();
            const friends = document.getElementById("cf-friends").value.trim().split(",").map(h => h.trim()).filter(h => h.length > 0);
            const minRating = parseInt(document.getElementById("cf-min-rating").value.trim());
            const maxRating = parseInt(document.getElementById("cf-max-rating").value.trim());
            const tagsInput = document.getElementById("cf-tags").value.trim();
            const resultBox = document.getElementById("cf-result");
            resultBox.innerHTML = "⏳ Loading...";

            if (!yourHandle || friends.length === 0 || isNaN(minRating) || isNaN(maxRating) || minRating > maxRating) {
                resultBox.innerHTML = "❌ Please fill in all fields correctly. Minimum rating should not exceed maximum rating.";
                return;
            }

            const requiredTags = tagsInput.length > 0
                ? tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
                : [];

            try {
                const yourSolved = await getSolvedProblems(yourHandle);
                const allFriendSolved = new Map();

                for (const f of friends) {
                    const solved = await getSolvedProblems(f);
                    for (const p of solved) {
                        if (
                            p.rating >= minRating && p.rating <= maxRating &&
                            requiredTags.every(rt => p.tags.some(t => t.toLowerCase() === rt))
                        ) {
                            const key = `${p.contestId}-${p.index}`;
                            if (!yourSolved.has(key) && !allFriendSolved.has(key)) {
                                allFriendSolved.set(key, p);
                            }
                        }
                    }
                }

                if (allFriendSolved.size === 0) {
                    resultBox.innerHTML = "✅ No new problems to solve with given filters!";
                } else {
                    const links = Array.from(allFriendSolved.values()).map(p => {
                        const tagsHtml = p.tags.map(t =>
                            `<span style="background:#0078d7; color:white; padding:2px 6px; border-radius:12px; font-size:11px; margin-right:4px; display:inline-block;">${t}</span>`
                        ).join("");
                        return `<li style="margin-bottom:8px;">
                            <a href="https://codeforces.com/problemset/problem/${p.contestId}/${p.index}" target="_blank" style="color:#0078d7; text-decoration:none; font-weight:600;">
                            (${p.rating}) ${p.name} ${p.contestId}/${p.index}
                            </a><br>
                            ${tagsHtml}
                        </li>`;
                    });
                    resultBox.innerHTML = `<b>${links.length} new problem(s):</b><ul style="padding-left:18px; margin-top:8px; color:#444;">${links.join("")}</ul>`;
                }

            } catch (err) {
                resultBox.innerHTML = `❌ Error: ${err.message}`;
            }
        };

        async function getSolvedProblems(handle) {
            const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
            const data = await res.json();
            if (data.status !== "OK") throw new Error(`User not found: ${handle}`);

            const solved = new Set();
            const problems = [];

            for (const sub of data.result) {
                if (sub.verdict === "OK" && sub.problem && sub.problem.contestId) {
                    const key = `${sub.problem.contestId}-${sub.problem.index}`;
                    solved.add(key);
                    problems.push({
                        contestId: sub.problem.contestId,
                        index: sub.problem.index,
                        rating: sub.problem.rating || 0,
                        name: sub.problem.name || "No Name",
                        tags: sub.problem.tags || []
                    });
                }
            }
            return handle === document.getElementById("cf-your-handle").value.trim()
                ? solved : problems;
        }

        // Panel sürükleme fonksiyonu
        function makePanelDraggable() {
            const panel = document.getElementById("cf-panel");
            const header = document.getElementById("cf-header");

            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            header.addEventListener("mousedown", function (e) {
                isDragging = true;
                offsetX = e.clientX - panel.getBoundingClientRect().left;
                offsetY = e.clientY - panel.getBoundingClientRect().top;
                document.body.style.userSelect = "none";
            });

            document.addEventListener("mousemove", function (e) {
                if (!isDragging) return;
                panel.style.left = `${e.clientX - offsetX}px`;
                panel.style.top = `${e.clientY - offsetY}px`;
                panel.style.right = "auto";
            });

            document.addEventListener("mouseup", function () {
                isDragging = false;
                document.body.style.userSelect = "auto";
            });
        }

        makePanelDraggable();

    }, 1000);
})();
