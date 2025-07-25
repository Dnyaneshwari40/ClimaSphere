const API_KEY = "ded0d039fcad679edcd1af9015978d34";

let recentCities = [];

function formatDate(dt) {
  return new Date(dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
}

function updateRecentCities(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) recentCities.pop();
  }

  const container = document.getElementById("cityBoxes");
  container.innerHTML = "";
  recentCities.forEach(c => {
    const div = document.createElement("div");
    div.className = "city-box";
    div.textContent = c;
    div.onclick = () => {
      document.getElementById("cityInput").value = c;
      getWeather();
    };
    container.appendChild(div);
  });
}

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city");

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    if (data.cod !== 200) {
      alert("City not found");
      return;
    }

    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const forecastData = await forecastRes.json();

    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("highLow").textContent = `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
    document.getElementById("weatherDesc").textContent = `${data.weather[0].main} - ${data.weather[0].description}`;
    document.getElementById("dateTime").textContent = new Date().toDateString();
    document.getElementById("mapCity").textContent = data.name;

    updateDangerLevel(data.main.temp);
    updateForecast(forecastData.list);
    updateRecentCities(data.name);
  } catch (err) {
    console.error(err);
    alert("Error fetching weather data");
  }
}

function updateDangerLevel(temp) {
  const danger = document.getElementById("dangerLevel");
  const status = document.getElementById("statusText");

  if (temp > 35) {
    status.textContent = "Extreme Heat";
    danger.style.width = "90%";
  } else if (temp > 25) {
    status.textContent = "Warm";
    danger.style.width = "60%";
  } else if (temp > 15) {
    status.textContent = "Mild";
    danger.style.width = "40%";
  } else {
    status.textContent = "Cold";
    danger.style.width = "20%";
  }
}

function updateForecast(forecastList) {
  const graph = document.getElementById("forecastGraph");
  graph.innerHTML = "";

  const daily = {};
  forecastList.forEach(item => {
    const day = formatDate(item.dt);
    if (!daily[day]) daily[day] = [];
    daily[day].push(item.main.temp);
  });

  Object.keys(daily).slice(0, 5).forEach(day => {
    const temps = daily[day];
    const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

    const div = document.createElement("div");
    div.className = "forecast-day";
    div.innerHTML = `<strong>${day}</strong><br/>${avg}°C`;
    graph.appendChild(div);
  });
}
