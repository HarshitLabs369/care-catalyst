"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const measurementForm = document.getElementById("measurementForm");
    const followupForm = document.getElementById("followupForm");

    if (!measurementForm || !followupForm) return;

    const patientSelects = [
        document.getElementById("measurementPatient"),
        document.getElementById("followupPatient")
    ];

    const measurementList = document.getElementById("measurementList");
    const followupList = document.getElementById("followupList");
    const measurementMessage = document.getElementById("measurementMessage");
    const followupMessage = document.getElementById("followupMessage");

    const measurementDate = document.getElementById("measurementDate");
    const followupDate = document.getElementById("followupDate");

    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    measurementDate.value = localToday;
    followupDate.value = localToday;

    function readArray(key) {
        const value = readStoredData(key, []);
        return Array.isArray(value) ? value : [];
    }

    function getPatients() {
        return readArray(CARE_CATALYST_KEYS.patients);
    }

    function getPatientName(id) {
        const patient = getPatients().find(function (item) {
            return item.id === id;
        });

        return patient ? patient.name : "Patient record unavailable";
    }

    function populatePatientOptions() {
        patientSelects.forEach(function (select) {
            const previous = select.value;
            select.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = getPatients().length
                ? "Select a patient"
                : "Add a patient first";

            select.appendChild(placeholder);

            getPatients().forEach(function (patient) {
                const option = document.createElement("option");
                option.value = patient.id;
                option.textContent = patient.name + " (" + patient.id + ")";
                select.appendChild(option);
            });

            if (getPatients().some(function (p) {
                return p.id === previous;
            })) {
                select.value = previous;
            }
        });
    }

    function makeText(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;

        if (className) element.className = className;

        return element;
    }

    function renderMeasurements() {
        const records = readArray(CARE_CATALYST_KEYS.measurements);
        measurementList.replaceChildren();

        document.getElementById("measurementCount").textContent =
            records.length + " sample measurement(s) recorded";

        if (!records.length) {
            measurementList.appendChild(makeText(
                "p", "No measurements yet. Add a sample using the form above.",
                "empty-state"
            ));
            return;
        }

        records.slice().reverse().forEach(function (record) {
            const card = document.createElement("article");
            card.className = "feature-card record-card";

            card.append(
                makeText("h3", record.type),
                makeText("p", "Value: " + record.value),
                makeText("p", "Patient: " + getPatientName(record.patientId)),
                makeText("p", "Date: " + record.date),
                makeText("p", "Demo record only; not clinically assessed.", "form-help")
            );

            measurementList.appendChild(card);
        });
    }

    function renderFollowups() {
        const reminders = readArray(CARE_CATALYST_KEYS.followups);
        followupList.replaceChildren();

        document.getElementById("followupCount").textContent =
            reminders.length + " reminder(s) saved";

        if (!reminders.length) {
            followupList.appendChild(makeText(
                "p", "No reminders yet. Add a follow-up reminder above.",
                "empty-state"
            ));
            return;
        }

        reminders.slice().sort(function (a, b) {
            return a.date.localeCompare(b.date);
        }).forEach(function (reminder) {
            const card = document.createElement("article");
            card.className = "feature-card record-card";

            card.append(
                makeText("h3", reminder.text),
                makeText("p", "Patient: " + getPatientName(reminder.patientId)),
                makeText("p", "Reminder date: " + reminder.date)
            );

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "button button-secondary";
            remove.textContent = "Delete reminder";

            remove.addEventListener("click", function () {
                if (!window.confirm("Delete this reminder?")) return;

                const updated = readArray(CARE_CATALYST_KEYS.followups)
                    .filter(function (item) {
                        return item.id !== reminder.id;
                    });

                if (saveStoredData(CARE_CATALYST_KEYS.followups, updated)) {
                    followupMessage.textContent = "Reminder deleted.";
                    renderFollowups();
                } else {
                    followupMessage.textContent = "Could not save this change.";
                }
            });

            card.appendChild(remove);
            followupList.appendChild(card);
        });
    }

    measurementForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const patientId = document.getElementById("measurementPatient").value;
        const type = document.getElementById("measurementType").value;
        const value = document.getElementById("measurementValue").value.trim();
        const date = measurementDate.value;

        if (!getPatients().some(function (p) {
            return p.id === patientId;
        })) {
            measurementMessage.textContent = "Please add and select a patient first.";
            return;
        }

        if (!date || date > localToday) {
            measurementMessage.textContent = "Enter a valid date that is not in the future.";
            return;
        }

        let valid = false;

        if (type === "Heart rate") {
            valid = /^\d{1,3}$/.test(value) &&
                Number(value) >= 1 && Number(value) <= 300;
        } else if (type === "Temperature") {
            valid = /^\d{2}(?:\.\d{1,2})?$/.test(value) &&
                Number(value) >= 25 && Number(value) <= 45;
        } else if (type === "Blood pressure") {
            const match = value.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
            valid = Boolean(match) &&
                Number(match[1]) >= 30 && Number(match[1]) <= 300 &&
                Number(match[2]) >= 20 && Number(match[2]) <= 200;
        }

        if (!valid) {
            measurementMessage.textContent =
                "Check the format: heart rate as a number, temperature in °C, or blood pressure as systolic/diastolic.";
            return;
        }

        const records = readArray(CARE_CATALYST_KEYS.measurements);
        records.push({
            id: "M-" + Date.now(),
            patientId: patientId,
            type: type,
            value: value,
            date: date
        });

        if (!saveStoredData(CARE_CATALYST_KEYS.measurements, records)) {
            measurementMessage.textContent = "Could not save the measurement.";
            return;
        }

        measurementForm.reset();
        measurementDate.value = localToday;
        populatePatientOptions();
        measurementMessage.textContent = "Sample measurement saved. No clinical interpretation was performed.";
        renderMeasurements();
    });

    followupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const patientId = document.getElementById("followupPatient").value;
        const date = followupDate.value;
        const text = document.getElementById("followupText").value.trim();

        if (!getPatients().some(function (p) {
            return p.id === patientId;
        })) {
            followupMessage.textContent = "Please add and select a patient first.";
            return;
        }

        if (!date || !text) {
            followupMessage.textContent = "Enter a reminder and date.";
            return;
        }

        const reminders = readArray(CARE_CATALYST_KEYS.followups);
        reminders.push({
            id: "F-" + Date.now(),
            patientId: patientId,
            date: date,
            text: text
        });

        if (!saveStoredData(CARE_CATALYST_KEYS.followups, reminders)) {
            followupMessage.textContent = "Could not save the reminder.";
            return;
        }

        followupForm.reset();
        followupDate.value = localToday;
        populatePatientOptions();
        followupMessage.textContent = "Reminder saved in this browser.";
        renderFollowups();
    });

    populatePatientOptions();
    renderMeasurements();
    renderFollowups();
});