const temperatureOutput = document.querySelector("#weather-temperature");
const descriptionOutput = document.querySelector("#weather-description");
const humidityOutput = document.querySelector("#weather-humidity");
const windOutput = document.querySelector("#weather-wind");
const updatedOutput = document.querySelector("#weather-updated");
const forecastOutput = document.querySelector("#weather-forecast");
const spotlightsOutput = document.querySelector("#spotlights-list");
const currentYearOutput = document.querySelector("#current-year");
const lastModifiedOutput = document.querySelector("#last-modified");

const weatherApiUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=0.3476&longitude=32.5825" +
  "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
  "&daily=temperature_2m_max,temperature_2m_min&timezone=Africa%2FKampala&forecast_days=4";

async function fetchWeather() {
  const response = await fetch(weatherApiUrl);
  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }
  return response.json();
}

function describeWeatherCode(code) {
  if (code === 0) return "clear sky";
  if (code === 1) return "mainly clear";
  if (code === 2) return "partly cloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55].includes(code)) return "drizzle";
  if ([56, 57].includes(code)) return "freezing drizzle";
  if ([61, 63, 65].includes(code)) return "rain";
  if ([66, 67].includes(code)) return "freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "snow";
  if ([80, 81, 82].includes(code)) return "rain showers";
  if ([85, 86].includes(code)) return "snow showers";
  if (code === 95) return "thunderstorm";
  if ([96, 99].includes(code)) return "thunderstorm with hail";
  return "conditions unavailable";
}

function renderForecast(forecastData) {
  const { time, temperature_2m_min: lows, temperature_2m_max: highs } = forecastData.daily;
  if (time.length < 4 || lows.length < 4 || highs.length < 4) {
    throw new Error("Weather service did not return three upcoming forecast days.");
  }

  forecastOutput.replaceChildren(
    ...time.slice(1, 4).map((date, index) => {
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
      range.textContent = `${Math.round(lows[index + 1])}° / ${Math.round(highs[index + 1])}°C`;
      range.setAttribute(
        "aria-label",
        `Low ${Math.round(lows[index + 1])} degrees, high ${Math.round(highs[index + 1])} degrees Celsius`,
      );

      item.append(dateLabel, range);
      return item;
    }),
  );
}

async function loadKampalaWeather() {
  try {
    const data = await fetchWeather();
    const { current } = data;
    if (!current || !Number.isFinite(current.temperature_2m)) {
      throw new TypeError("Weather service returned invalid current conditions.");
    }

    temperatureOutput.textContent = `${Math.round(current.temperature_2m)}°C`;
    descriptionOutput.textContent = describeWeatherCode(current.weather_code);
    humidityOutput.textContent = `${current.relative_humidity_2m}%`;
    windOutput.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    updatedOutput.textContent = `Updated ${current.time.slice(11, 16)} EAT`;

    renderForecast(data);
  } catch (error) {
    console.error("Unable to load Kampala weather from Open-Meteo.", error);
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
