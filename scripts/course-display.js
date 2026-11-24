const courseList = document.querySelector("#course-list");
const courseTotal = document.querySelector("#course-total");
const courseFilterButtons = document.querySelectorAll(".course-filter");
const courseDetails = document.querySelector("#course-details");
const courseDialogClose = courseDetails?.querySelector(".course-dialog-close");
const courseDialogContent = courseDetails?.querySelector(".course-dialog-content");

if (
  !(courseList instanceof HTMLUListElement) ||
  !(courseTotal instanceof HTMLElement) ||
  !(courseDetails instanceof HTMLDialogElement) ||
  !(courseDialogClose instanceof HTMLButtonElement) ||
  !(courseDialogContent instanceof HTMLElement)
) {
  throw new Error("Course list elements are missing from the page.");
}

const displayCourseDetails = (course) => {
  const createDetail = (label, value) => {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    paragraph.append(strong, document.createTextNode(value));
    return paragraph;
  };

  const code = document.createElement("p");
  code.className = "course-dialog-code";
  code.id = "course-detail-code";
  code.textContent = `${course.subject} ${course.number}`;

  const title = document.createElement("h2");
  title.textContent = course.title;

  const description = document.createElement("p");
  description.textContent = course.description;

  courseDialogContent.replaceChildren(
    code,
    title,
    createDetail("Credits", String(course.credits)),
    createDetail("Certificate", course.certificate),
    description,
    createDetail("Technologies", course.technology.join(", ")),
  );
  courseDetails.showModal();
  courseDialogClose.focus();
};

const renderCourses = (filter = "ALL") => {
  const visibleCourses = courses.filter(
    (course) => filter === "ALL" || course.subject === filter,
  );

  courseList.replaceChildren();

  visibleCourses.forEach((course) => {
    const listItem = document.createElement("li");
    const card = document.createElement("button");
    card.type = "button";
    card.className = `course-card${course.completed ? " is-completed" : ""}`;
    card.setAttribute("aria-label", `View details for ${course.subject} ${course.number}: ${course.title}`);
    card.addEventListener("click", () => displayCourseDetails(course));

    const header = document.createElement("span");
    header.className = "course-card-header";

    const code = document.createElement("span");
    code.className = "course-code";
    code.textContent = `${course.subject} ${course.number}`;

    const completion = document.createElement("span");
    completion.className = "course-status";
    completion.textContent = course.completed ? "Completed" : "In progress";

    const title = document.createElement("span");
    title.className = "course-title";
    title.textContent = course.title;

    const description = document.createElement("span");
    description.className = "course-description";
    description.textContent = course.description;

    const details = document.createElement("span");
    details.className = "course-details";
    details.textContent = `${course.credits} credits · ${course.technology.join(", ")}`;

    header.append(code, completion);
    card.append(header, title, description, details);
    listItem.append(card);
    courseList.append(listItem);
  });

  const displayedCredits = visibleCourses.reduce(
    (total, course) => total + course.credits,
    0,
  );
  courseTotal.textContent = `Total credits displayed: ${displayedCredits}`;

  courseFilterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
  });
};

courseFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderCourses(button.dataset.filter ?? "ALL");
  });
});

renderCourses();

courseDialogClose.addEventListener("click", () => courseDetails.close());
courseDetails.addEventListener("cancel", () => courseDetails.close());
courseDetails.addEventListener("click", (event) => {
  if (event.target === courseDetails) courseDetails.close();
});
