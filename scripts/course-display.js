const courseList = document.querySelector("#course-list");
const courseTotal = document.querySelector("#course-total");
const courseFilterButtons = document.querySelectorAll(".course-filter");

if (!(courseList instanceof HTMLUListElement) || !(courseTotal instanceof HTMLElement)) {
  throw new Error("Course list elements are missing from the page.");
}

const renderCourses = (filter = "ALL") => {
  const visibleCourses = courses.filter(
    (course) => filter === "ALL" || course.subject === filter,
  );

  courseList.replaceChildren();

  visibleCourses.forEach((course) => {
    const card = document.createElement("li");
    card.className = `course-card${course.completed ? " is-completed" : ""}`;

    const header = document.createElement("div");
    header.className = "course-card-header";

    const code = document.createElement("span");
    code.className = "course-code";
    code.textContent = `${course.subject} ${course.number}`;

    const completion = document.createElement("span");
    completion.className = "course-status";
    completion.textContent = course.completed ? "Completed" : "In progress";

    const title = document.createElement("h3");
    title.className = "course-title";
    title.textContent = course.title;

    const description = document.createElement("p");
    description.className = "course-description";
    description.textContent = course.description;

    const details = document.createElement("p");
    details.className = "course-details";
    details.textContent = `${course.credits} credits · ${course.technology.join(", ")}`;

    header.append(code, completion);
    card.append(header, title, description, details);
    courseList.append(card);
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
