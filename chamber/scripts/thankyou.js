const summary = document.querySelector("#application-summary");
const params = new URLSearchParams(window.location.search);
const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

const requiredFields = [
  ["First name", "first-name"],
  ["Last name", "last-name"],
  ["Email address", "email"],
  ["Mobile phone number", "mobile"],
  ["Business or organization", "organization"],
  ["Application received", "timestamp"],
];
const entries = requiredFields.map(([label, name]) => [label, params.get(name)?.trim() ?? ""]);

if (entries.some(([, value]) => value === "")) {
  summary.setAttribute("role", "alert");
} else {
  const list = document.createElement("dl");
  entries.forEach(([label, value]) => {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    if (label === "Application received") {
      const date = new Date(value);
      description.textContent = Number.isNaN(date.getTime()) ? value : date.toLocaleString();
    } else {
      description.textContent = value;
    }
    list.append(term, description);
  });
  summary.replaceChildren(list);
}
