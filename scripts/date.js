const copyrightSymbol = document.querySelector("#copyright-symbol");
const currentYear = document.querySelector("#currentyear");
const lastModified = document.querySelector("#lastModified");

if (copyrightSymbol instanceof HTMLElement && currentYear instanceof HTMLElement) {
  copyrightSymbol.textContent = "\u00a9";
  currentYear.textContent = String(new Date().getFullYear());
}

if (lastModified instanceof HTMLElement) {
  lastModified.textContent = `Last modified: ${document.lastModified}`;
}
