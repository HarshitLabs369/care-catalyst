"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("patientForm");
    if (!form) return;

    const nameInput = document.getElementById("patientName");
    const ageInput = document.getElementById("patientAge");
    const notesInput = document.getElementById("patientNotes");
    const list = document.getElementById("patientList");
    const count = document.getElementById("patientCount");
    const message = document.getElementById("patientMessage");

    function getPatients() {
        const data = readStoredData(CARE_CATALYST_KEYS.patients, []);
        return Array.isArray(data) ? data : [];
    }

    function renderPatients() {
        const patients = getPatients();
        list.replaceChildren();
        count.textContent = patients.length + " patient record(s)";

        if (patients.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = "No patients yet. Add a fictional patient using the form above.";
            list.appendChild(empty);
            return;
        }

        patients.forEach(function (patient) {
            const card = document.createElement("article");
            card.className = "feature-card record-card";

            const heading = document.createElement("h3");
            heading.textContent = patient.name;

            const age = document.createElement("p");
            age.textContent = "Age: " + patient.age;

            const notes = document.createElement("p");
            notes.textContent = patient.notes || "No notes added.";

            const id = document.createElement("p");
            id.className = "form-help";
            id.textContent = "Demo ID: " + patient.id;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "button button-secondary";
            remove.textContent = "Delete record";

            remove.addEventListener("click", function () {
                if (!window.confirm("Delete this fictional demo record?")) return;

                const remaining = getPatients().filter(function (item) {
                    return item.id !== patient.id;
                });

                if (saveStoredData(CARE_CATALYST_KEYS.patients, remaining)) {
                    renderPatients();
                    message.textContent = "Record deleted.";
                } else {
                    message.textContent = "Could not save the change.";
                }
            });

            card.append(heading, age, notes, id, remove);
            list.appendChild(card);
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const age = Number(ageInput.value);
        const notes = notesInput.value.trim();

        if (!name || !Number.isInteger(age) || age < 0 || age > 120) {
            message.textContent = "Enter a name and a valid age from 0 to 120.";
            return;
        }

        const patients = getPatients();
        const patient = {
            id: "P-" + Date.now(),
            name: name,
            age: age,
            notes: notes
        };

        patients.push(patient);

        if (!saveStoredData(CARE_CATALYST_KEYS.patients, patients)) {
            message.textContent = "Could not save the record. Check browser storage.";
            return;
        }

        form.reset();
        message.textContent = "Fictional patient record saved.";
        renderPatients();
    });

    renderPatients();
});