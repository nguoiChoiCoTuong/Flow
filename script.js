// -------------------------------
// 🌍 Khởi tạo bản đồ
// -------------------------------

// -------------------------------
// 🔧 Biến toàn cục
// -------------------------------
let currentUnit = "C"; // "C" hoặc "F"
let currentCity = "Hanoi";
let userContext = "general"; // "general", "travel", "sports", "work", "outdoor"



const cities = {
  "An Giang": [10.5149, 105.1132],
  "Bà Rịa – Vũng Tàu": [10.3554, 107.0849],
  "Bắc Giang": [21.3093, 106.6165],
  "Bắc Kạn": [22.1333, 105.8333],
  "Bạc Liêu": [9.2879, 105.7245],
  "Bến Tre": [10.2349, 106.3750],
  "Bình Dương": [10.9691, 106.6527],
  "Bình Định": [13.7799, 109.1800],
  "Bình Phước": [11.6504, 106.6000],
  "Bình Thuận": [10.9337, 108.1001],
  "Cà Mau": [9.1774, 105.1500],
  "Cao Bằng": [22.6667, 106.2500],
  "Đắk Lắk": [12.5000, 108.0000],
  "Đắk Nông": [12.0000, 107.5000],
  "Điện Biên": [21.0000, 103.0000],
  "Đồng Nai": [10.9691, 106.6527],
  "Đồng Tháp": [10.2333, 105.7500],
  "Gia Lai": [13.9794, 108.0000],
  "Hà Giang": [22.8333, 104.9833],
  "Hà Nam": [20.5833, 105.9333],
  "Hà Nội": [21.0285, 105.8542],
  "Hải Dương": [20.9797, 106.6012],
  "Hải Phòng": [20.8449, 106.6881],
  "Hậu Giang": [9.7500, 105.0000],
  "Hòa Bình": [20.8000, 105.2000],
  "Hưng Yên": [20.9825, 106.0625],
  "Khánh Hòa": [12.2500, 109.2000],
  "Kiên Giang": [10.0000, 104.0000],
  "Kon Tum": [14.0000, 108.0000],
  "Lai Châu": [22.3333, 103.0000],
  "Lâm Đồng": [12.0000, 108.0000],
  "Lạng Sơn": [21.8500, 106.7500],
  "Lào Cai": [22.3333, 104.0000],
  "Long An": [10.0000, 106.0000],
  "Nam Định": [20.4167, 106.1667],
  "Nghệ An": [19.2500, 105.6667],
  "Ninh Bình": [20.2500, 105.9333],
  "Ninh Thuận": [11.7500, 108.0000],
  "Phú Thọ": [21.3000, 105.2000],
  "Phú Yên": [13.0000, 109.0000],
  "Quảng Bình": [17.5000, 106.0000],
  "Quảng Nam": [15.5000, 108.0000],
  "Quảng Ngãi": [14.0000, 108.0000],
  "Quảng Ninh": [21.0000, 107.0000],
  "Quảng Trị": [16.7500, 107.0000],
  "Sóc Trăng": [9.5000, 105.7500],
  "Sơn La": [21.0000, 103.0000],
  "Tây Ninh": [11.0000, 106.0000],
  "Thái Bình": [20.4500, 106.3000],
  "Thái Nguyên": [21.6000, 105.8000],
  "Thanh Hóa": [19.2500, 105.7500],
  "Thừa Thiên – Huế": [16.4667, 107.5833],
  "Tiền Giang": [10.0000, 106.0000],
  "Trà Vinh": [9.9333, 106.2500],
  "Tuyên Quang": [21.8000, 105.2000],
  "Vĩnh Long": [10.2533, 105.9708],
  "Vĩnh Phúc": [21.3000, 105.6000],
  "Cần Thơ": [10.0452, 105.7469],
  "Đà Nẵng": [16.0471, 108.2068],
  "Hồ Chí Minh": [10.7769, 106.7009]
};

// -------------------------------
// 📡 Fetch dữ liệu từ API
// -------------------------------
async function fetchNASAData(lat, lon) {
  const today = new Date();
  const end = today.toISOString().split("T")[0].replace(/-/g, "");
  const startDate = new Date();
  startDate.setDate(today.getDate() - (31*2));
  const start = startDate.toISOString().split("T")[0].replace(/-/g, "");

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS2M&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

  const res = await fetch(url);
  const data = await res.json();
  return data.properties.parameter; // { T2M, RH2M, WS2M }
}

async function fetchMeteoData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability,temperature_2m,cloud_cover,visibility,wind_speed_10m,relative_humidity_2m&timezone=auto`;
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
        visibility: [],
        precipitation: []
      };
    }
    result[day].temp.push(hourly.temperature_2m[i]);
    result[day].humidity.push(hourly.relative_humidity_2m[i]);
    result[day].wind.push(hourly.wind_speed_10m[i]);
    result[day].rainProb.push(hourly.precipitation_probability[i]);
    result[day].cloud.push(hourly.cloud_cover[i]);
    result[day].visibility.push(hourly.visibility[i] / 1000); // Chuyển từ m sang km
    result[day].precipitation.push(hourly.precipitation[i]);
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
      avgVisibility: avg(result[day].visibility),
      totalPrecipitation: result[day].precipitation.reduce((a,b)=>a+b,0).toFixed(1)
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
    time: Object.keys(normalized).slice(0, 7) // 7 ngày
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
    const visibility = todayData.avgVisibility !== undefined ? todayData.avgVisibility.toFixed(2) : "--";
    const precipitation = todayData.totalPrecipitation !== undefined ? todayData.totalPrecipitation : 0;

    console.log("Processed Data:", { avgTemp, humidityToday, windToday, rainProb, cloudCover, visibility, precipitation });

    // Cập nhật UI
    document.getElementById("city-name").innerText = city;
    document.getElementById("desc").innerText = "Data from Open-Meteo & NASA";
    document.getElementById("temp").innerText = avgTemp !== null ? formatTemp(avgTemp) : "--";
    document.getElementById("humidity").innerText = humidityToday !== null ? humidityToday + "%" : "--";
    document.getElementById("wind").innerText = windToday !== null ? windToday + " km/h" : "--";
    document.getElementById("visibility").innerText = visibility !== "--" ? visibility + " km" : "--";
    if (document.getElementById("precipitation")) {
      document.getElementById("precipitation").innerText = precipitation + " mm";
    }
    if (document.getElementById("rainProb")) {
      document.getElementById("rainProb").innerText = rainProb + "%";
    }

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
        <span>🌧️ ${dayData.totalPrecipitation !== undefined ? dayData.totalPrecipitation : "--"} mm</span>
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
      visibility,
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

//async function updateWeatherFromCoords(lat, lon, cityName) {
//  try {
//    const forecastData = await fetchForecastData(lat, lon);
//    const nasaData = await fetchNASAData(lat, lon);
//
//    document.getElementById("city-name").innerText = cityName;
//    document.getElementById("desc").innerText = "Data from coordinates";
//
//    const tempToday = nasaData.T2M ? toNumber(Object.values(nasaData.T2M)[0]) : null;
//    const humidityToday = nasaData.RH2M ? toNumber(Object.values(nasaData.RH2M)[0]) : null;
//    const windToday = nasaData.WS2M ? toNumber((Object.values(nasaData.WS2M)[0] * 3.6).toFixed(1)) : null;
//
//    const todayData = forecastData || {};
//    const avgTemp = todayData.avgTemp !== undefined ? todayData.avgTemp : tempToday;
//    const rainProb = todayData.maxRainProb !== undefined ? todayData.maxRainProb : 0;
//    const visibility = todayData.avgVisibility !== undefined ? todayData.avgVisibility.toFixed(2) : "--";
//    const precipitation = todayData.totalPrecipitation !== undefined ? todayData.totalPrecipitation : 0;
//    const cloudCover = todayData.avgCloud !== undefined ? todayData.avgCloud : 0;
//
//    document.getElementById("temp").innerText = avgTemp !== null ? formatTemp(avgTemp) : "--";
//    document.getElementById("humidity").innerText = humidityToday !== null ? humidityToday + "%" : "--";
//    document.getElementById("wind").innerText = windToday !== null ? windToday + " km/h" : "--";
//    document.getElementById("visibility").innerText = visibility !== "--" ? visibility + " km" : "--";
//    document.getElementById("precipitation").innerText = precipitation + " mm";
//    document.getElementById("rainProb").innerText = rainProb + "%";
//
//    // Forecast 5 ngày
//    const forecastContainer = document.getElementById("forecast-container");
//    forecastContainer.innerHTML = "";
//    const days = forecastData.time || [];
//    days.forEach((day, i) => {
//      const dayData = normalizeForecast(forecastData.meteoData)[day] || {}; // Sử dụng meteoData từ forecastData
//      const div = document.createElement("div");
//      div.className = "forecast-day";
//      div.innerHTML = `
//        <span>${day}</span>
//        <span>${dayData.avgTemp !== undefined ? Math.round(dayData.avgTemp) : "--"}°C</span>
//        <span>☁️ ${dayData.avgCloud !== undefined ? Math.round(dayData.avgCloud) : "--"}%</span>
//        <span>💧 ${dayData.maxRainProb !== undefined ? Math.round(dayData.maxRainProb) : "--"}%</span>
//        <span>🌧️ ${dayData.totalPrecipitation !== undefined ? dayData.totalPrecipitation : "--"} mm</span>
//      `;
//      forecastContainer.appendChild(div);
//    });
//
//    // Lời khuyên
//    const adviceList = generateAdvice(
//      avgTemp,
//      "Weather data",
//      humidityToday,
//      windToday,
//      userContext,
//      rainProb,
//      cloudCover,
//      visibility,
//    );
//    const adviceUl = document.getElementById("advice-list");
//    adviceUl.innerHTML = "";
//    adviceList.forEach(advice => {
//      const li = document.createElement("li");
//      li.textContent = advice;
//      adviceUl.appendChild(li);
//    });
//
//  } catch (err) {
//    console.error("Error fetching data for coords:", err);
//    document.getElementById("city-name").innerText = cityName;
//    document.getElementById("desc").innerText = "⚠️ Data unavailable";
//  }
//}

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
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability,cloud_cover,visibility&timezone=auto&start_date=${dateInput}&end_date=${dateInput}`;
    const omRes = await fetch(omUrl);
    const omData = await omRes.json();
    const dailyPrecip = dailyAvg(omData.hourly?.precipitation || []);
    const dailyRainProb = dailyAvg(omData.hourly?.precipitation_probability || []);

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
        rainProb: dailyRainProb,
        visibility: (dailyAvg(omData.hourly?.visibility || []) / 1000).toFixed(2), // Chuyển sang km
        precipitation: dailyPrecip
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
  const precipitation = toNumber(current.precipitation);

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
    document.getElementById("visibility").innerText = visibility.toFixed(2) + " km";
  }
  if (precipitation !== null && document.getElementById("precipitation")) {
    document.getElementById("precipitation").innerText = precipitation + " mm";
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
    { condition: d => d.temp !== null && d.temp < 0, advice: "🥶 Very cold, wear multiple layers." },
{ condition: d => d.temp !== null && d.temp < 10, advice: "🧥 Cold, wear a jacket." },
{ condition: d => d.temp !== null && d.temp > 30, advice: "🔥 Hot, wear light clothes and stay hydrated." },
{ condition: d => d.temp !== null && d.temp > 25 && d.temp <= 30, advice: "😎 Pleasant weather, wear light clothes." },

{ condition: d => d.rainProb !== null && d.rainProb > 70, advice: "☔ High chance of rain, carry an umbrella or raincoat." },
{ condition: d => d.rainProb !== null && d.rainProb > 40 && d.rainProb <= 70, advice: "🌦️ Possible showers, be careful when going out." },

{ condition: d => /Snow|❄️/.test(d.desc), advice: "❄️ Snowy, watch out for slippery surfaces." },

{ condition: d => d.cloud !== null && d.cloud > 70, advice: "☁️ Cloudy, low sunlight." },
{ condition: d => d.cloud !== null && d.cloud < 30, advice: "🌞 Clear sky, possible strong sunlight." },

{ condition: d => d.visibility !== null && d.visibility < 2, advice: "🌫️ Low visibility, drive carefully." },
{ condition: d => d.visibility !== null && d.visibility < 0.5, advice: "🚨 Dense fog, avoid long drives." },

{ condition: d => d.wind !== null && d.wind > 50, advice: "💨 Very strong wind, avoid going out." },
{ condition: d => d.wind !== null && d.wind > 25 && d.wind <= 50, advice: "🍃 Strong wind, take precautions." },

{ condition: d => d.humidity !== null && d.humidity > 80, advice: "💧 High humidity, may feel muggy." },

{ condition: d => d.context === "travel" && d.rainProb !== null && d.rainProb > 50, advice: "🚗 Rainy, roads may be slippery while driving." },
{ condition: d => d.context === "travel" && d.temp !== null && d.temp > 32, advice: "🧳 Bring extra water while traveling." },

{ condition: d => d.context === "work" && d.temp !== null && d.temp < 15, advice: "💼 Cold, dress neatly for work." },
{ condition: d => d.context === "work" && d.cloud !== null && d.cloud < 40, advice: "☀️ Nice day, work will be more pleasant." },

{ condition: d => d.context === "sport" && d.temp !== null && d.temp > 30, advice: "🏃 Avoid outdoor exercise at noon." },
{ condition: d => d.context === "sport" && d.wind !== null && d.wind > 30, advice: "⚽ Strong wind, limit outdoor sports." },

{ condition: d => d.context === "outdoor" && d.rainProb !== null && d.rainProb > 50, advice: "🌧️ Rainy, avoid outdoor activities." },
{ condition: d => d.context === "outdoor" && d.temp !== null && d.temp < 10, advice: "🧥 Cold, wear warm clothes if going outside." },
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
     const [lat, lon] = cities[city];
     L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>${city}</b><br>Click for weather`)
        .on("click", () => {
            updateWeather(city);
            map.flyTo([lat, lon], 10, { animate: true, duration: 1.5 });
        });
}

// Gắn sự kiện cho date-picker
document.getElementById("date-picker").addEventListener("change", fetchWeatherForDate);

// Khởi động mặc định
updateWeather("Hanoi");
updateDate();

//Resizer
const resizer = document.getElementById("resizer");
const leftPanel = document.getElementById("weather-info");
let isResizing = false;

resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "col-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  let newWidth = (e.clientX / window.innerWidth) * 100; // %
  if (newWidth > 15 && newWidth < 50) {
    leftPanel.style.width = newWidth + "%";
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.cursor = "default";
});

