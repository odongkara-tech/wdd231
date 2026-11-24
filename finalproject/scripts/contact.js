const form = document.querySelector("#project-form");
const status = document.querySelector("#form-status");

form.addEventListener("submit", (event) => {
  const formData = new FormData(form);
  const draft = Object.fromEntries(formData.entries());
  try {
    localStorage.setItem("frames-of-kampala-inquiry-draft", JSON.stringify(draft));
  } catch (error) {
    console.error("Could not save the inquiry draft.", error);
  }
  status.textContent = "Preparing your inquiry…";
});

try {
  const saved = JSON.parse(localStorage.getItem("frames-of-kampala-inquiry-draft") ?? "null");
  if (saved && typeof saved === "object") {
    for (const [name, value] of Object.entries(saved)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        field.checked = value === "yes";
      } else if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.value = String(value);
      }
    }
  }
} catch (error) {
  console.error("Could not restore the inquiry draft.", error);
}
