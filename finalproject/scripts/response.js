const output = document.querySelector("#response-data");
const params = new URLSearchParams(window.location.search);
const fields = [
  ["Name", "name"],
  ["Email", "email"],
  ["Project type", "project-type"],
  ["Location", "location"],
  ["Project details", "details"],
  ["Portfolio updates", "updates"],
];

const list = document.createElement("dl");
fields.forEach(([label, name]) => {
  const value = params.get(name);
  if (!value) return;
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value;
  list.append(term, description);
});

output.replaceChildren(list);
