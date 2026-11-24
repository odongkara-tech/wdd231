const grid = document.querySelector("#gallery-grid");
const status = document.querySelector("#gallery-status");
const dialog = document.querySelector("#photo-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogTitle = document.querySelector("#dialog-title");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogDescription = document.querySelector("#dialog-description");
const dialogCredit = document.querySelector("#dialog-credit");
const closeDialog = document.querySelector("#dialog-close");

let photographs = [];
let activeCategory = "all";
const favoritesKey = "frames-of-kampala-favorites";

function getFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(favoritesKey) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveFavorite(id) {
  const favorites = getFavorites();
  const next = favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id];
  localStorage.setItem(favoritesKey, JSON.stringify(next));
  renderGallery();
}

function openPhoto(photo) {
  dialogImage.src = photo.image;
  dialogImage.alt = photo.title;
  dialogTitle.textContent = photo.title;
  dialogMeta.textContent = `${photo.location} · ${photo.year}${photo.camera ? ` · ${photo.camera}` : ""}`;
  dialogDescription.textContent = photo.description;
  dialogCredit.replaceChildren();
  if (photo.source && photo.photographer && photo.license && photo.licenseUrl) {
    const sourceLink = document.createElement("a");
    sourceLink.href = photo.source;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = `Photo: ${photo.photographer}`;

    const licenseLink = document.createElement("a");
    licenseLink.href = photo.licenseUrl;
    licenseLink.target = "_blank";
    licenseLink.rel = "noopener noreferrer";
    licenseLink.textContent = photo.license;

    dialogCredit.append(sourceLink, document.createTextNode(" · "), licenseLink);
  }
  dialog.showModal();
}

function createPhotoCard(photo) {
  const article = document.createElement("article");
  article.className = "photo-card";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.setAttribute("aria-label", `Open details for ${photo.title}`);

  const image = document.createElement("img");
  image.src = photo.image;
  image.alt = photo.description;
  image.loading = "lazy";
  image.width = photo.width ?? 900;
  image.height = photo.height ?? 675;

  const copy = document.createElement("div");
  copy.className = "photo-copy";
  const title = document.createElement("h2");
  title.textContent = photo.title;
  const meta = document.createElement("p");
  meta.className = "photo-meta";
  meta.textContent = `${photo.location} · ${photo.category} · ${photo.year}`;
  const credit = document.createElement("p");
  credit.className = "photo-credit";
  if (photo.source && photo.photographer && photo.license && photo.licenseUrl) {
    const sourceLink = document.createElement("a");
    sourceLink.href = photo.source;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = `Photo: ${photo.photographer}`;

    const licenseLink = document.createElement("a");
    licenseLink.href = photo.licenseUrl;
    licenseLink.target = "_blank";
    licenseLink.rel = "noopener noreferrer";
    licenseLink.textContent = photo.license;

    credit.append(sourceLink, document.createTextNode(" · "), licenseLink);
  }

  openButton.append(image);
  openButton.addEventListener("click", () => openPhoto(photo));
  copy.append(title, meta);
  if (credit.hasChildNodes()) copy.append(credit);

  const favorites = getFavorites();
  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = `favorite-button${favorites.includes(photo.id) ? " is-favorite" : ""}`;
  favoriteButton.setAttribute("aria-pressed", String(favorites.includes(photo.id)));
  favoriteButton.textContent = favorites.includes(photo.id) ? "Saved to favorites" : "Save to favorites";
  favoriteButton.addEventListener("click", () => saveFavorite(photo.id));

  copy.append(favoriteButton);
  article.append(openButton, copy);
  return article;
}

function renderGallery() {
  const favoritesOnly = activeCategory === "favorites";
  const favorites = getFavorites();
  const visible = photographs.filter((photo) => {
    if (favoritesOnly) return favorites.includes(photo.id);
    return activeCategory === "all" || photo.category === activeCategory;
  });

  grid.replaceChildren(...visible.map(createPhotoCard));
  status.textContent = `${visible.length} photograph${visible.length === 1 ? "" : "s"} shown`;
}

async function loadGallery() {
  try {
    const response = await fetch("data/photographs.json");
    if (!response.ok) throw new Error(`Photo data failed with status ${response.status}`);
    photographs = await response.json();
    if (!Array.isArray(photographs) || photographs.length < 15) {
      throw new TypeError("The photo collection must contain at least 15 photographs.");
    }
    renderGallery();
  } catch (error) {
    console.error("Unable to load the photo gallery.", error);
    status.setAttribute("role", "alert");
    status.textContent = "The photo gallery is unavailable right now.";
  }
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    activeCategory = button.dataset.category;
    renderGallery();
  });
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

loadGallery();
