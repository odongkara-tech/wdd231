const temperatureOutput = document.querySelector("#weather-temperature");
const descriptionOutput = document.querySelector("#weather-description");
const humidityOutput = document.querySelector("#weather-humidity");
const windOutput = document.querySelector("#weather-wind");
const updatedOutput = document.querySelector("#weather-updated");
const forecastOutput = document.querySelector("#weather-forecast");
const spotlightsOutput = document.querySelector("#spotlights-list");
const currentYearOutput = document.querySelector("#current-year");
const lastModifiedOutput = document.querySelector("#last-modified");

const weatherApiBase = "https://api.openweathermap.org/data/2.5";
const locationQuery = "lat=0.3476&lon=32.5825&units=metric";

async function fetchWeather(endpoint, apiKey) {
  const response = await fetch(
    `${weatherApiBase}/${endpoint}?${locationQuery}&appid=${encodeURIComponent(apiKey)}`,
  );
  if (!response.ok) {
    throw new Error(`OpenWeatherMap ${endpoint} request failed with status ${response.status}`);
  }
  return response.json();
}

function getLocalDateTime(timestamp, timezoneOffset) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString();
}

function renderForecast(forecastData) {
  const timezoneOffset = forecastData.city.timezone;
  const today = getLocalDateTime(Date.now() / 1000, timezoneOffset).slice(0, 10);
  const temperaturesByDate = new Map();

  forecastData.list.forEach((entry) => {
    const localDate = getLocalDateTime(entry.dt, timezoneOffset).slice(0, 10);
    if (localDate <= today) {
      return;
    }

    const temperatures = temperaturesByDate.get(localDate) ?? {
      low: entry.main.temp_min,
      high: entry.main.temp_max,
    };
    temperatures.low = Math.min(temperatures.low, entry.main.temp_min);
    temperatures.high = Math.max(temperatures.high, entry.main.temp_max);
    temperaturesByDate.set(localDate, temperatures);
  });

  const forecastDays = [...temperaturesByDate.entries()].slice(0, 3);
  if (forecastDays.length < 3) {
    throw new Error("OpenWeatherMap did not return three upcoming forecast days.");
  }

  forecastOutput.replaceChildren(
    ...forecastDays.map(([date, temperatures]) => {
      const item = document.createElement("li");
      item.className = "forecast-day";

      const dateLabel = document.createElement("span");
      dateLabel.className = "forecast-date";
      dateLabel.textContent = new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });

      const range = document.createElement("span");
      range.className = "forecast-range";
      range.textContent = `${Math.round(temperatures.low)}° / ${Math.round(temperatures.high)}°C`;
      range.setAttribute(
        "aria-label",
        `Low ${Math.round(temperatures.low)} degrees, high ${Math.round(temperatures.high)} degrees Celsius`,
      );

      item.append(dateLabel, range);
      return item;
    }),
  );
}

async function loadKampalaWeather() {
  try {
    const apiKey = window.weatherApiKey;
    if (!apiKey) {
      throw new Error("OpenWeatherMap API key is not configured for this local page.");
    }

    const [currentData, forecastData] = await Promise.all([
      fetchWeather("weather", apiKey),
      fetchWeather("forecast", apiKey),
    ]);
    const currentWeather = currentData.weather[0];

    temperatureOutput.textContent = `${Math.round(currentData.main.temp)}°C`;
    descriptionOutput.textContent = currentWeather.description;
    humidityOutput.textContent = `${currentData.main.humidity}%`;
    windOutput.textContent = `${Math.round(currentData.wind.speed)} m/s`;
    updatedOutput.textContent = `Updated ${new Date(currentData.dt * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Kampala",
    })} EAT`;

    renderForecast(forecastData);
  } catch (error) {
    console.error("Unable to load Kampala weather.", error);
    temperatureOutput.textContent = "Unavailable";
    descriptionOutput.textContent = "Current weather could not be loaded.";
    humidityOutput.textContent = "—";
    windOutput.textContent = "—";
    updatedOutput.textContent = "Please try again later.";
    forecastOutput.replaceChildren();
    const message = document.createElement("li");
    message.textContent = "Forecast unavailable.";
    forecastOutput.append(message);
  }
}

function createSpotlight(member) {
  const card = document.createElement("article");
  card.className = "spotlight-card";
  card.dataset.level = String(member.membershipLevel);

  const logo = document.createElement("img");
  logo.src = `images/${member.image}`;
  logo.alt = `${member.name} logo`;
  logo.width = 120;
  logo.height = 120;
  logo.loading = "lazy";

  const content = document.createElement("div");
  content.className = "spotlight-copy";

  const membershipName = member.membershipLevel === 3 ? "Gold" : "Silver";
  const membership = document.createElement("span");
  membership.className = "spotlight-membership";
  membership.textContent = `${membershipName} member`;

  const name = document.createElement("h3");
  name.textContent = member.name;

  const details = document.createElement("dl");
  details.className = "spotlight-details";

  const addressTerm = document.createElement("dt");
  addressTerm.textContent = "Address";
  const addressValue = document.createElement("dd");
  addressValue.textContent = member.address;

  const phoneTerm = document.createElement("dt");
  phoneTerm.textContent = "Phone";
  const phoneValue = document.createElement("dd");
  const phoneLink = document.createElement("a");
  phoneLink.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
  phoneLink.textContent = member.phone;
  phoneValue.append(phoneLink);

  const websiteTerm = document.createElement("dt");
  websiteTerm.textContent = "Website";
  const websiteValue = document.createElement("dd");
  const websiteLink = document.createElement("a");
  websiteLink.href = member.website;
  websiteLink.target = "_blank";
  websiteLink.rel = "noopener noreferrer";
  websiteLink.textContent = member.website.replace(/^https?:\/\//, "");
  websiteValue.append(websiteLink);

  details.append(
    addressTerm,
    addressValue,
    phoneTerm,
    phoneValue,
    websiteTerm,
    websiteValue,
  );
  content.append(membership, name, details);
  card.append(logo, content);
  return card;
}

async function loadMemberSpotlights() {
  try {
    const response = await fetch("data/members.json");
    if (!response.ok) {
      throw new Error(`Member data request failed with status ${response.status}`);
    }

    const members = await response.json();
    if (!Array.isArray(members)) {
      throw new TypeError("Member data must be an array.");
    }

    const eligibleMembers = members.filter(
      (member) => member.membershipLevel === 2 || member.membershipLevel === 3,
    );
    if (eligibleMembers.length < 2) {
      throw new Error("At least two silver or gold members are required for spotlights.");
    }

    for (let index = eligibleMembers.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [eligibleMembers[index], eligibleMembers[randomIndex]] = [
        eligibleMembers[randomIndex],
        eligibleMembers[index],
      ];
    }

    const spotlightCount = Math.min(
      eligibleMembers.length,
      Math.random() < 0.5 ? 2 : 3,
    );
    spotlightsOutput.replaceChildren(
      ...eligibleMembers.slice(0, spotlightCount).map(createSpotlight),
    );
    spotlightsOutput.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Unable to load member spotlights.", error);
    const message = document.createElement("p");
    message.className = "spotlights-message";
    message.setAttribute("role", "alert");
    message.textContent = "Member spotlights are unavailable right now.";
    spotlightsOutput.replaceChildren(message);
    spotlightsOutput.setAttribute("aria-busy", "false");
  }
}

const now = new Date();
currentYearOutput.textContent = String(now.getFullYear());
const modifiedDate = new Date(document.lastModified);
lastModifiedOutput.dateTime = modifiedDate.toISOString();
lastModifiedOutput.textContent = modifiedDate.toLocaleDateString();

loadKampalaWeather();
loadMemberSpotlights();
