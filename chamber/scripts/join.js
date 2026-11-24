const timestampField = document.querySelector("#timestamp");
if (timestampField instanceof HTMLInputElement) {
  timestampField.value = new Date().toISOString();
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

document.querySelectorAll("[data-dialog]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const dialog = document.getElementById(link.dataset.dialog);
    if (!(dialog instanceof HTMLDialogElement)) {
      throw new Error(`Membership details dialog not found: ${link.dataset.dialog}`);
    }

    event.preventDefault();
    dialog.showModal();
    dialog.querySelector(".dialog-close")?.focus();
  });
});

document.querySelectorAll(".membership-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});
