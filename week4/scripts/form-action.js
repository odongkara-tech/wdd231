const output = document.querySelector("#submission");
const params = new URLSearchParams(window.location.search);
const fields = [
  ["Full name", "full-name"],
  ["Email address", "email"],
  ["Phone number", "phone"],
  ["Project type", "project"],
  ["Preferred contact method", "contact-method"],
  ["Interests", "interest"],
  ["Preferred date", "date"],
  ["Project details", "message"],
  ["Project updates", "updates"],
];

const entries = fields
  .map(([label, name]) => [label, params.getAll(name).filter(Boolean)])
  .filter(([, values]) => values.length > 0);

if (entries.length > 0) {
  const list = document.createElement("dl");
  entries.forEach(([label, values]) => {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = values.join(", ");
    list.append(term, description);
  });
  output.replaceChildren(list);
}
