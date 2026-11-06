const memberList = document.querySelector("#member-list");
const resultCount = document.querySelector("#results-count");
const searchInput = document.querySelector("#member-search");
const viewButtons = document.querySelectorAll(".view-button");

let members = [];
const membershipNames = {
  1: "Member",
  2: "Silver",
  3: "Gold",
};

const createDetail = (label, value, href) => {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;

  if (href) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = value;
    if (href.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    description.append(link);
  } else {
    description.textContent = value;
  }

  row.append(term, description);
  return row;
};

const renderMembers = () => {
  const query = searchInput.value.trim().toLowerCase();
  const filteredMembers = members.filter((member) => {
    const searchableText = `${member.name} ${member.category} ${member.address}`.toLowerCase();
    return searchableText.includes(query);
  });

  resultCount.textContent = `${filteredMembers.length} ${
    filteredMembers.length === 1 ? "member" : "members"
  }${query ? ` found for “${searchInput.value.trim()}”` : ""}`;

  if (filteredMembers.length === 0) {
    memberList.innerHTML = '<p class="directory-message">No members match your search. Try another business name or service.</p>';
    return;
  }

  memberList.replaceChildren(...filteredMembers.map((member) => {
    const card = document.createElement("article");
    card.className = "member-card";

    const logo = document.createElement("img");
    logo.className = "member-logo";
    logo.src = `images/${member.image}`;
    logo.alt = `${member.name} logo`;
    logo.width = 120;
    logo.height = 120;
    logo.loading = "lazy";

    const heading = document.createElement("div");
    heading.className = "member-heading";
    const name = document.createElement("h3");
    name.textContent = member.name;
    const category = document.createElement("p");
    category.className = "member-category";
    category.textContent = member.category;
    heading.append(name, category);

    const membership = document.createElement("span");
    membership.className = "membership-level";
    membership.dataset.level = String(member.membershipLevel);
    membership.textContent = `${membershipNames[member.membershipLevel]} member`;

    const details = document.createElement("dl");
    details.className = "member-details";
    details.append(
      createDetail("Address", member.address),
      createDetail("Phone", member.phone, `tel:${member.phone.replace(/[^\d+]/g, "")}`),
      createDetail(
        "Website",
        member.website.replace(/^https?:\/\//, ""),
        member.website,
      ),
    );

    card.append(logo, heading, membership, details);
    return card;
  }));
};

const setView = (view) => {
  const isList = view === "list";
  memberList.classList.toggle("is-list", isList);
  viewButtons.forEach((button) => {
    const isSelected = button.dataset.view === view;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
};

searchInput.addEventListener("input", renderMembers);
viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

const updateFooter = () => {
  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  const modifiedDate = new Date(document.lastModified);
  const lastModified = document.querySelector("#last-modified");
  lastModified.dateTime = modifiedDate.toISOString();
  lastModified.textContent = modifiedDate.toLocaleString();
};

const loadMembers = async () => {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) {
      throw new Error(`Member directory request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length < 7) {
      throw new TypeError("Member directory data must contain at least seven entries.");
    }

    members = data;
    memberList.setAttribute("aria-busy", "false");
    renderMembers();
  } catch (error) {
    console.error("Unable to load the member directory.", error);
    memberList.setAttribute("aria-busy", "false");
    resultCount.textContent = "The member directory could not be loaded.";
    const errorMessage = document.createElement("p");
    errorMessage.className = "directory-message";
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = "We could not load member listings right now. Please try again later.";
    memberList.replaceChildren(errorMessage);
  }
};

updateFooter();
loadMembers();
