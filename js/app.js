"use strict";

// Shared JavaScript functions for Care Catalyst.

const CARE_CATALYST_KEYS = {
    patients: "careCatalystPatients",
    measurements: "careCatalystMeasurements",
    followups: "careCatalystFollowups"
};

function readStoredData(key, fallback = []) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) {
            return fallback;
        }

        return JSON.parse(saved);
    } catch (error) {
        console.error("Could not read saved data:", error);
        return fallback;
    }
}

function saveStoredData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Could not save data:", error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".navigation a").forEach(function (link) {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    console.log("Care Catalyst loaded:", currentPage);
});