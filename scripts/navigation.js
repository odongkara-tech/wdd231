const menuButton = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector("#site-nav");

if (menuButton instanceof HTMLButtonElement && siteNavigation instanceof HTMLElement) {
  document.documentElement.classList.add("js");

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    siteNavigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    menuButton.setAttribute(
      "aria-label",
      isExpanded ? "Open navigation menu" : "Close navigation menu",
    );
    siteNavigation.classList.toggle("is-open", !isExpanded);
  });

  siteNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNavigation.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });
}
