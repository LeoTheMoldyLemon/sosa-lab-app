async function loadName() {
    const results = await fetch("/name");
    const name = await results.text();
    document.getElementById("title").innerHTML = sanitizeHtml(`Hello ${name}!`);
}

async function loadNotes() {
    const noteListElement = document.getElementById("note-list");
    const results = await fetch("/notes");
    const notes = await results.json();
    for (const note of notes) {
        const noteTextElement = document.createElement("p");
        const noteNameElement = document.createElement("h3");
        noteNameElement.innerHTML = sanitizeHtml(note.name);
        noteTextElement.innerHTML = sanitizeHtml(note.text);
        const noteElement = document.createElement("li");
        noteElement.appendChild(noteNameElement);
        noteElement.appendChild(noteTextElement);
        noteListElement.appendChild(noteElement);
    }
}
loadNotes();
loadName();
