// -------------------------------
// 🌍 Khởi tạo bản đồ
// -------------------------------
var map = L.map("map").setView([16, 107], 5);
L.tileLayer(
    'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png',
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }
).addTo(map);

// -------------------------------
// 🔧 Biến toàn cục
// -------------------------------
let currentUnit = "C"; // "C" hoặc "F"
let currentCity = "Hanoi";
let userContext = "general"; // "general", "travel", "sports", "work", "outdoor"

const cities = {
  "Hanoi": [21.0285, 105.8542],
  "Ho Chi Minh": [10.7769, 106.7009],
  "Da Nang": [16.0471, 108.2068],
  "Can Tho": [10.0452, 105.7469]
};

// -------------------------------
// 📡 Fetch dữ liệu từ API
// -------------------------------
async function fetchNASAData(lat, lon) {
  const today = new Date();
  const end = today.toISOString().split("T")[0].replace(/-/g, "");
  const startDate = new Date();
  startDate.setDate(today.getDate() - 5);
  const start = startDate.toISOString().split("T")[0].replace(/-/g, "");

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS2M&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

  const res = await fetch(url);
  const data = await res.json();
  return data.properties.parameter; // { T2M, RH2M, WS2M }
}

async function fetchMeteoData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,temperature_2m,cloud_cover,visibility,wind_speed_10m,relative_humidity_2m&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  return data.hourly;
}

function normalizeForecast(hourly) {
  const result = {};
  const times = hourly.time;

  times.forEach((t, i) => {
    const day = t.split("T")[0]; // lấy YYYY-MM-DD
    if (!result[day]) {
      result[day] = {
        temp: [],
        humidity: [],
        wind: [],
        rainProb: [],
        cloud: [],
        visibility: []
      };
    }
    result[day].temp.push(hourly.temperature_2m[i]);
    result[day].humidity.push(hourly.relative_humidity_2m[i]);
    result[day].wind.push(hourly.wind_speed_10m[i]);
    result[day].rainProb.push(hourly.precipitation_probability[i]);
    result[day].cloud.push(hourly.cloud_cover[i]);
    result[day].visibility.push(hourly.visibility[i] / 1000); // Chuyển từ m sang km
  });

  // Tính trung bình mỗi ngày
  const daily = {};
  Object.keys(result).forEach(day => {
    daily[day] = {
      avgTemp: avg(result[day].temp),
      avgHumidity: avg(result[day].humidity),
      avgWind: avg(result[day].wind),
      maxRainProb: Math.max(...result[day].rainProb),
      avgCloud: avg(result[day].cloud),
      avgVisibility: avg(result[day].visibility)
    };
  });

  return daily;
}

function avg(arr) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

async function fetchForecastData(lat, lon) {
  const [nasaData, meteoData] = await Promise.all([fetchNASAData(lat, lon), fetchMeteoData(lat, lon)]);
  const hourly = meteoData;
  const normalized = normalizeForecast(hourly);
  const today = new Date().toISOString().split("T")[0];
  return {
    nasaData,
    meteoData,
    ...normalized[today] || {},
    time: Object.keys(normalized).slice(0, 5) // 5 ngày
  };
}

// -------------------------------
// 🎨 UI Update
// -------------------------------
async function updateWeather(city) {
  currentCity = city;
  const [lat, lon] = cities[city];

  try {
    console.log("Fetching data for", city, lat, lon);
    const forecastData = await fetchForecastData(lat, lon);
    const nasaData = await fetchNASAData(lat, lon);
    console.log("NASA Data:", nasaData);
    console.log("Forecast Data:", forecastData);

    // Dữ liệu hôm nay từ NASA
    const tempToday = nasaData.T2M ? toNumber(Object.values(nasaData.T2M)[0]) : null;
    const humidityToday = nasaData.RH2M ? toNumber(Object.values(nasaData.RH2M)[0]) : null;
    const windToday = nasaData.WS2M ? toNumber((Object.values(nasaData.WS2M)[0] * 3.6).toFixed(1)) : null;

    // Dữ liệu từ forecast
    const todayData = forecastData || {};
    const avgTemp = todayData.avgTemp !== undefined ? todayData.avgTemp : tempToday;
    const rainProb = todayData.maxRainProb !== undefined ? todayData.maxRainProb : 0;
    const cloudCover = todayData.avgCloud !== undefined ? todayData.avgCloud : 0;
    const visibility = todayData.avgVisibility !== undefined ? todayData.avgVisibility : "--";

    console.log("Processed Data:", { avgTemp, humidityToday, windToday, rainProb, cloudCover, visibility });

    // Cập nhật UI
    document.getElementById("city-name").innerText = city;
    document.getElementById("desc").innerText = "Data from Open-Meteo & NASA";
    document.getElementById("temp").innerText = avgTemp !== null ? formatTemp(avgTemp) : "--";
    document.getElementById("humidity").innerText = humidityToday !== null ? humidityToday + "%" : "--";
    document.getElementById("wind").innerText = windToday !== null ? windToday + " km/h" : "--";
    document.getElementById("visibility").innerText = visibility !== "--" ? visibility + " km" : "--";

    // Forecast 5 ngày
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";
    const days = forecastData.time || [];
    days.forEach((day, i) => {
      const dayData = normalizeForecast(forecastData.meteoData)[day] || {}; // Sử dụng meteoData từ forecastData
      const div = document.createElement("div");
      div.className = "forecast-day";
      div.innerHTML = `
        <span>${day}</span>
        <span>${dayData.avgTemp !== undefined ? Math.round(dayData.avgTemp) : "--"}°C</span>
        <span>☁️ ${dayData.avgCloud !== undefined ? Math.round(dayData.avgCloud) : "--"}%</span>
        <span>💧 ${dayData.maxRainProb !== undefined ? Math.round(dayData.maxRainProb) : "--"}%</span>
      `;
      forecastContainer.appendChild(div);
    });

    // Lời khuyên
    const adviceList = generateAdvice(
      avgTemp,
      "Weather data",
      humidityToday,
      windToday,
      userContext,
      rainProb,
      cloudCover,
      visibility
    );
    const adviceUl = document.getElementById("advice-list");
    adviceUl.innerHTML = "";
    adviceList.forEach(advice => {
      const li = document.createElement("li");
      li.textContent = advice;
      adviceUl.appendChild(li);
    });

  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById("city-name").innerText = city;
    document.getElementById("desc").innerText = "⚠️ Data unavailable";
  }
}
// -------------------------------
// 📅 Lấy thời tiết theo ngày chọn
// -------------------------------
async function fetchWeatherForDate() {
  const dateInput = document.getElementById("date-picker").value;
  if (!dateInput) {
    alert("Please select a date first!");
    return;
  }

  const [lat, lon] = cities[currentCity];
  const day = dateInput.replace(/-/g, "");

  try {
    // Lấy dữ liệu NASA POWER
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MIN,T2M_MAX,RH2M,WS2M&community=RE&longitude=${lon}&latitude=${lat}&start=${day}&end=${day}&format=JSON`;
    const nasaRes = await fetch(nasaUrl);
    const nasaData = await nasaRes.json();

    if (!nasaData.properties || !nasaData.properties.parameter) {
      throw new Error("NASA POWER: dữ liệu rỗng hoặc sai cấu trúc");
    }

    const weather = nasaData.properties.parameter;
    const safeGet = (param) => weather[param] && weather[param][day] !== undefined ? weather[param][day] : "--";

    // Lấy dữ liệu Open-Meteo
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,cloud_cover,visibility&timezone=auto&start_date=${dateInput}&end_date=${dateInput}`;
    const omRes = await fetch(omUrl);
    const omData = await omRes.json();

    function dailyAvg(arr) {
      return arr && arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "--";
    }

    const cityData = {
      current: {
        temp: safeGet("T2M"),
        tempMin: safeGet("T2M_MIN"),
        tempMax: safeGet("T2M_MAX"),
        desc: "NASA + OpenMeteo",
        humidity: safeGet("RH2M"),
        wind: safeGet("WS2M") !== "--" ? (safeGet("WS2M") * 3.6).toFixed(1) : "--",
        cloud: dailyAvg(omData.hourly?.cloud_cover || []),
        rainProb: dailyAvg(omData.hourly?.precipitation_probability || []),
        visibility: dailyAvg(omData.hourly?.visibility || []) / 1000 // Chuyển sang km
      },
    };

    updateWeatherFromAPI(currentCity, cityData);

  } catch (err) {
    console.error("API fetch error:", err);
    document.getElementById("desc").innerText = "⚠️ Data unavailable";
  }
}

// -------------------------------
// 🎯 Render từ NASA cho 1 ngày cụ thể
// -------------------------------
function updateWeatherFromAPI(city, cityData) {
  const current = cityData.current;

  const temp = toNumber(current.temp);
  const tempMin = toNumber(current.tempMin);
  const tempMax = toNumber(current.tempMax);
  const humidity = toNumber(current.humidity);
  const wind = toNumber(current.wind);
  const cloud = toNumber(current.cloud);
  const rainProb = toNumber(current.rainProb);
  const visibility = toNumber(current.visibility);

  document.getElementById("city-name").innerText = city;
  document.getElementById("desc").innerText = current.desc;
  document.getElementById("temp").innerText = formatTemp(temp);
  document.getElementById("humidity").innerText = humidity !== null ? humidity + "%" : "--";
  document.getElementById("wind").innerText = wind !== null ? wind + " km/h" : "--";
  if (cloud !== null && document.getElementById("cloud")) {
    document.getElementById("cloud").innerText = cloud + "%";
  }
  if (rainProb !== null && document.getElementById("rainProb")) {
    document.getElementById("rainProb").innerText = rainProb + "%";
  }
  if (visibility !== null && document.getElementById("visibility")) {
    document.getElementById("visibility").innerText = visibility + " km";
  }

  document.getElementById("forecast-container").innerHTML = "";

  const avgTemp = (tempMax !== null && tempMin !== null) ? (tempMax + tempMin) / 2 : temp;

  const adviceList = generateAdvice(
    avgTemp,
    current.desc,
    humidity,
    wind,
    userContext,
    rainProb,
    cloud,
    visibility
  );

  const adviceUl = document.getElementById("advice-list");
  adviceUl.innerHTML = "";
  adviceList.forEach(advice => {
    const li = document.createElement("li");
    li.textContent = advice;
    adviceUl.appendChild(li);
  });
}

// -------------------------------
// 🧾 Các hàm tiện ích
// -------------------------------
function formatTemp(celsiusValue) {
  if (celsiusValue === "--" || celsiusValue === null) return "--";
  if (currentUnit === "C") {
    return Math.round(celsiusValue) + "°C";
  } else {
    return Math.round((celsiusValue * 9 / 5) + 32) + "°F";
  }
}

function toggleUnit() {
  currentUnit = currentUnit === "C" ? "F" : "C";
  updateWeather(currentCity);
}

function generateAdvice(temp, desc, humidity, wind, context, rainProb, cloud, visibility) {
  const rules = [
    { condition: d => d.temp !== null && d.temp < 0, advice: "🥶 Rất lạnh, mặc nhiều lớp." },
    { condition: d => d.temp !== null && d.temp < 10, advice: "🧥 Lạnh, nên mặc áo khoác." },
    { condition: d => d.temp !== null && d.temp > 30, advice: "🔥 Nóng, mặc đồ mỏng và uống đủ nước." },
    { condition: d => d.temp !== null && d.temp > 25 && d.temp <= 30, advice: "😎 Thời tiết dễ chịu, mặc đồ nhẹ." },

    { condition: d => d.rainProb !== null && d.rainProb > 70, advice: "☔ Khả năng mưa cao, nên mang ô hoặc áo mưa." },
    { condition: d => d.rainProb !== null && d.rainProb > 40 && d.rainProb <= 70, advice: "🌦️ Có thể có mưa rào, chú ý khi ra ngoài." },

    { condition: d => /Snow|❄️/.test(d.desc), advice: "❄️ Có tuyết, cẩn thận trơn trượt." },

    { condition: d => d.cloud !== null && d.cloud > 70, advice: "☁️ Trời nhiều mây, ánh sáng yếu." },
    { condition: d => d.cloud !== null && d.cloud < 30, advice: "🌞 Trời quang, có thể có nắng gắt." },

    { condition: d => d.visibility !== null && d.visibility < 2, advice: "🌫️ Tầm nhìn kém, lái xe cần chú ý." },
    { condition: d => d.visibility !== null && d.visibility < 0.5, advice: "🚨 Sương mù dày, hạn chế lái xe đường dài." },

    { condition: d => d.wind !== null && d.wind > 50, advice: "💨 Gió rất mạnh, hạn chế ra ngoài." },
    { condition: d => d.wind !== null && d.wind > 25 && d.wind <= 50, advice: "🍃 Gió khá mạnh, cần chú ý." },

    { condition: d => d.humidity !== null && d.humidity > 80, advice: "💧 Độ ẩm cao, dễ cảm thấy oi bức." },

    { condition: d => d.context === "travel" && d.rainProb !== null && d.rainProb > 50, advice: "🚗 Trời mưa, đường trơn trượt khi lái xe." },
    { condition: d => d.context === "travel" && d.temp !== null && d.temp > 32, advice: "🧳 Mang thêm nước uống khi đi du lịch." },

    { condition: d => d.context === "work" && d.temp !== null && d.temp < 15, advice: "💼 Trời lạnh, mặc gọn gàng khi đi làm." },
    { condition: d => d.context === "work" && d.cloud !== null && d.cloud < 40, advice: "☀️ Ngày đẹp, đi làm sẽ dễ chịu hơn." },

    { condition: d => d.context === "sport" && d.temp !== null && d.temp > 30, advice: "🏃 Tránh tập ngoài trời lúc trưa." },
    { condition: d => d.context === "sport" && d.wind !== null && d.wind > 30, advice: "⚽ Gió to, hạn chế các môn ngoài trời." },

    { condition: d => d.context === "outdoor" && d.rainProb !== null && d.rainProb > 50, advice: "🌧️ Mưa, không nên tổ chức hoạt động ngoài trời." },
    { condition: d => d.context === "outdoor" && d.temp !== null && d.temp < 10, advice: "🧥 Trời lạnh, nếu ra ngoài nên mang áo ấm." },
  ];

  const input = { temp, desc, humidity, wind, context, rainProb, cloud, visibility };
  return rules.filter(rule => rule.condition(input)).map(rule => rule.advice);
}

function updateDate() {
  const now = new Date();
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
  document.getElementById("date-display").textContent = now.toLocaleDateString('en-GB', options) + " +07";
}

function changeContext() {
  userContext = document.getElementById("context-select").value;
  updateWeather(currentCity);
}

function toNumber(val) {
  if (val === "--" || val === undefined || val === null) return null;
  return Number(val);
}

// -------------------------------
// 🚀 Khởi động mặc định
// -------------------------------
for (let city in cities) {
  L.marker(cities[city]).addTo(map).on("click", () => {
    updateWeather(city);
    map.flyTo(cities[city], 10, { animate: true, duration: 1.5 });
  });
}

// Gắn sự kiện cho date-picker
document.getElementById("date-picker").addEventListener("change", fetchWeatherForDate);

// Khởi động mặc định
updateWeather("Hanoi");
updateDate();