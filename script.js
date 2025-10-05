// -------------------------------
// 🌍 Khởi tạo bản đồ
// -------------------------------

// -------------------------------
// 🔧 Biến toàn cục
// -------------------------------
let currentUnit = "C"; // "C" hoặc "F"
let currentCity = "Hanoi";
let userContext = "general"; // "general", "travel", "sports", "work", "outdoor"
let currentLat = null;
let currentLon = null;

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
  showLoading();
  try {
    const today = new Date();
    const end = today.toISOString().split("T")[0].replace(/-/g, "");
    const startDate = new Date();
    startDate.setDate(today.getDate() - 5);
    const start = startDate.toISOString().split("T")[0].replace(/-/g, "");

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS2M,ALLSKY_SFC_UV_INDEX,PS&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`NASA API error: ${res.status}`);
    }
    const data = await res.json();
    console.log("NASA Data:", data);
    return data.properties?.parameter || {};
  } catch (err) {
    console.error("Error in fetchNASAData:", err);
    return {};
  }
  finally {
    hideLoading();
  }
}

async function fetchMeteoData(lat, lon) {
  showLoading();
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability,temperature_2m,cloud_cover,visibility,wind_speed_10m,relative_humidity_2m,uv_index&daily=uv_index_max&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Meteo API error: ${res.status}`);
    }
    const data = await res.json();
    console.log("Meteo Data:", data);
    return data.hourly || {};
  } catch (err) {
    console.error("Error in fetchMeteoData:", err);
    return {};
  }
  finally {
    hideLoading();
  }
}

function normalizeForecast(hourly) {
  console.log("Hourly data:", hourly);
  const result = {};
  const times = hourly.time || [];
  times.forEach((t, i) => {
    const day = t.split("T")[0];
    if (!result[day]) {
      result[day] = {
        temp: [],
        humidity: [],
        wind: [],
        rainProb: [],
        cloud: [],
        visibility: [],
        precipitation: [],
        uv: []
      };
    }
    result[day].temp.push(hourly.temperature_2m?.[i] ?? 0);
    result[day].humidity.push(hourly.relative_humidity_2m?.[i] ?? 0);
    result[day].wind.push(hourly.wind_speed_10m?.[i] ?? 0);
    result[day].rainProb.push(hourly.precipitation_probability?.[i] ?? 0);
    result[day].cloud.push(hourly.cloud_cover?.[i] ?? 0);
    result[day].visibility.push((hourly.visibility?.[i] ?? 0) / 1000);
    result[day].precipitation.push(hourly.precipitation?.[i] ?? 0);
    result[day].uv.push(hourly.uv_index?.[i] ?? 0);
  });

  const daily = {};
  Object.keys(result).forEach(day => {
    daily[day] = {
      avgTemp: avg(result[day].temp),
      avgHumidity: avg(result[day].humidity),
      avgWind: avg(result[day].wind),
      maxRainProb: Math.max(...result[day].rainProb),
      avgCloud: avg(result[day].cloud),
      avgVisibility: avg(result[day].visibility),
      totalPrecipitation: result[day].precipitation.reduce((a, b) => a + b, 0).toFixed(1),
      maxUV: Math.max(...result[day].uv)
    };
  });
  console.log("Normalized forecast:", daily);
  return daily;
}

function avg(arr) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

async function fetchForecastData(lat, lon) {
  showLoading();
  try {
    const [nasaData, meteoData] = await Promise.all([
      fetchNASAData(lat, lon).catch(err => {
        console.error("NASA fetch failed:", err);
        return {};
      }),
      fetchMeteoData(lat, lon).catch(err => {
        console.error("Meteo fetch failed:", err);
        return {};
      })
    ]);
    console.log("NASA Data:", nasaData);
    console.log("Meteo Data:", meteoData);
    const hourly = meteoData || {};
    const normalized = normalizeForecast(hourly);
    const today = new Date().toISOString().split("T")[0];
    const allDays = Object.keys(normalized).filter(day => day >= today);
    return {
      nasaData,
      meteoData,
      ...normalized[today] || {},
      time: allDays.slice(0, 15)
    };
  } catch (err) {
    console.error("Error in fetchForecastData:", err);
    return { nasaData: {}, meteoData: {}, time: [] };
  }
  finally {
    hideLoading();
  }
}

// -------------------------------
// 🎨 UI Update
// -------------------------------
async function updateWeather(city) {
  currentCity = city;
  const [lat, lon] = cities[city] || [null, null];
  if (!lat || !lon) {
    console.error("Invalid city coordinates:", city);
    document.getElementById("city-name").innerText = city;
    document.getElementById("desc").innerText = "⚠️ Invalid city coordinates";
    return;
  }
  currentLat = lat;
  currentLon = lon;

  try {
    console.log("Fetching data for", city, lat, lon);
    const forecastData = await fetchForecastData(lat, lon);
    console.log("Forecast Data:", forecastData);
    
    const nasaData = forecastData.nasaData || {};
    const tempToday = nasaData.T2M ? toNumber(Object.values(nasaData.T2M)[0]) : null;
    const humidityToday = nasaData.RH2M ? toNumber(Object.values(nasaData.RH2M)[0]) : null;
    const windToday = nasaData.WS2M ? toNumber((Object.values(nasaData.WS2M)[0] * 3.6).toFixed(1)) : null;
    const pressureToday = nasaData.PS ? toNumber(Object.values(nasaData.PS)[0]) : null;
    const uvToday = nasaData.ALLSKY_SFC_UV_INDEX ? toNumber(Object.values(nasaData.ALLSKY_SFC_UV_INDEX)[0]) : null;

    const todayData = forecastData || {};
    const avgTemp = todayData.avgTemp !== undefined ? todayData.avgTemp : tempToday;
    const rainProb = todayData.maxRainProb !== undefined ? todayData.maxRainProb : 0;
    const cloudCover = todayData.avgCloud !== undefined ? todayData.avgCloud : 0;
    const visibility = todayData.avgVisibility !== undefined ? todayData.avgVisibility.toFixed(2) : "--";
    const precipitation = todayData.totalPrecipitation !== undefined ? todayData.totalPrecipitation : 0;

    console.log("Processed Data:", { avgTemp, humidityToday, windToday, rainProb, cloudCover, visibility, precipitation, pressureToday });

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
    if (document.getElementById("pressure")) {
      document.getElementById("pressure").innerText = pressureToday !== null ? pressureToday.toFixed(1) + " kPa" : "--";
    }
    if (document.getElementById("uvNow")) {
      document.getElementById("uvNow").innerText = uvToday !== null ? uvToday.toFixed(1) : "--";
    }

    const forecastContainer = document.getElementById("forecast-container");
    if (forecastContainer) {
      forecastContainer.innerHTML = "";
      const days = forecastData.time || [];
      const normalizedAll = forecastData.meteoData ? normalizeForecast(forecastData.meteoData) : {};

      days.forEach((day, i) => {
        const dayData = normalizedAll[day] || {};
        const div = document.createElement("div");
        div.className = "forecast-day";
        div.innerHTML = `
          <span>${day}</span>
          <span>${dayData.avgTemp !== undefined ? Math.round(dayData.avgTemp) : "--"}°C</span>
          <span>☁️ ${dayData.avgCloud !== undefined ? Math.round(dayData.avgCloud) : "--"}%</span>
          <span>💧 ${dayData.maxRainProb !== undefined ? Math.round(dayData.maxRainProb) : "--"}%</span>
          <span>🌧️ ${dayData.totalPrecipitation !== undefined ? dayData.totalPrecipitation : "--"} mm</span>
          <span>☀️ ${dayData.maxUV !== undefined ? dayData.maxUV.toFixed(1) : "--"}</span>
        `;
        forecastContainer.appendChild(div);
      });
    }

    // Render both rain and UV charts
    renderCharts(forecastData);

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
    if (adviceUl) {
      adviceUl.innerHTML = "";
      adviceList.forEach(advice => {
        const li = document.createElement("li");
        li.textContent = advice;
        adviceUl.appendChild(li);
      });
    }

  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById("city-name").innerText = city;
    document.getElementById("desc").innerText = "⚠️ Data unavailable";
  }
}

async function updateWeatherFromCoords(lat, lon, cityName) {
  currentLat = lat;
  currentLon = lon;
  currentCity = cityName;

  try {
    const forecastData = await fetchForecastData(lat, lon);
    const nasaData = forecastData?.nasaData || null;

    const cityEl = document.getElementById("city-name");
    const descEl = document.getElementById("desc");
    if (cityEl) cityEl.innerText = cityName;
    if (descEl) descEl.innerText = "Data from NASA + OpenMeteo";

    const safeFirstValue = obj => {
      if (!obj) return null;
      const vals = Object.values(obj || {});
      return vals.length ? toNumber(vals[0]) : null;
    };

    const tempToday = safeFirstValue(nasaData?.T2M);
    const humidityToday = safeFirstValue(nasaData?.RH2M);
    const windTodayRaw = safeFirstValue(nasaData?.WS2M);
    const windToday = windTodayRaw != null ? Number((windTodayRaw * 3.6).toFixed(1)) : null;
    const uvToday = safeFirstValue(nasaData.ALLSKY_SFC_UV_INDEX);
    const pressureToday = safeFirstValue(nasaData?.PS);

    const todayData = forecastData || {};
    const avgTemp = todayData.avgTemp !== undefined ? todayData.avgTemp : tempToday;
    const rainProb = todayData.maxRainProb !== undefined ? todayData.maxRainProb : 0;
    const visibilityNum = todayData.avgVisibility !== undefined ? Number(todayData.avgVisibility) : null;
    const visibilityText = visibilityNum != null ? visibilityNum.toFixed(2) : "--";
    const precipitation = todayData.totalPrecipitation !== undefined ? todayData.totalPrecipitation : 0;
    const cloudCover = todayData.avgCloud !== undefined ? todayData.avgCloud : 0;

    const setIf = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.innerText = value;
    };
    setIf("temp", avgTemp !== null ? formatTemp(avgTemp) : "--");
    setIf("humidity", humidityToday !== null ? humidityToday + "%" : "--");
    setIf("wind", windToday !== null ? windToday + " km/h" : "--");
    setIf("visibility", visibilityText !== "--" ? visibilityText + " km" : "--");
    setIf("precipitation", precipitation + " mm");
    setIf("rainProb", rainProb + "%");
    setIf("pressure", pressureToday !== null ? pressureToday.toFixed(1) + " kPa" : "--");
    setIf("uvNow", uvToday != null ? uvToday.toFixed(1) : "--");

    const forecastContainer = document.getElementById("forecast-container");
    if (forecastContainer) {
      forecastContainer.innerHTML = "";
      const days = Array.isArray(forecastData?.time) ? forecastData.time : [];
      const normalizedAll = forecastData?.meteoData ? normalizeForecast(forecastData.meteoData) : {};

      days.forEach(day => {
        const dayData = normalizedAll[day] || {};
        const tempText = dayData.avgTemp != null ? Math.round(dayData.avgTemp) + "°C" : "--";
        const cloudText = dayData.avgCloud != null ? Math.round(dayData.avgCloud) + "%" : "--";
        const rainText = dayData.maxRainProb != null ? Math.round(dayData.maxRainProb) + "%" : "--";
        const precipText = dayData.totalPrecipitation != null ? dayData.totalPrecipitation + " mm" : "--";
        const uvText = dayData.maxUV != null ? dayData.maxUV.toFixed(1) : "--";

        const div = document.createElement("div");
        div.className = "forecast-day";
        div.innerHTML = `
          <span>${day}</span>
          <span>${tempText}</span>
          <span>☁️ ${cloudText}</span>
          <span>💧 ${rainText}</span>
          <span>🌧️ ${precipText}</span>
          <span>☀️ ${uvText}</span>
        `;
        forecastContainer.appendChild(div);
      });
    }

    // Render both rain and UV charts
    renderCharts(forecastData);

    const adviceList = generateAdvice(
      avgTemp,
      "Weather data",
      humidityToday,
      windToday,
      userContext,
      rainProb,
      cloudCover,
      visibilityNum
    );

    const adviceUl = document.getElementById("advice-list");
    if (adviceUl) {
      adviceUl.innerHTML = "";
      adviceList.forEach(advice => {
        const li = document.createElement("li");
        li.textContent = advice;
        adviceUl.appendChild(li);
      });
    }

  } catch (err) {
    console.error("Error in updateWeatherFromCoords:", err);
    const cityEl = document.getElementById("city-name");
    const descEl = document.getElementById("desc");
    if (cityEl) cityEl.innerText = cityName;
    if (descEl) descEl.innerText = "⚠️ Data unavailable";
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

  const [lat, lon] = cities[currentCity] || [null, null];
  if (!lat || !lon) {
    console.error("Invalid city coordinates:", currentCity);
    document.getElementById("desc").innerText = "⚠️ Invalid city coordinates";
    return;
  }

  const day = dateInput.replace(/-/g, "");

  try {
    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MIN,T2M_MAX,RH2M,WS2M&community=RE&longitude=${lon}&latitude=${lat}&start=${day}&end=${day}&format=JSON`;
    const nasaRes = await fetch(nasaUrl);
    if (!nasaRes.ok) {
      throw new Error(`NASA API error: ${nasaRes.status}`);
    }
    const nasaData = await nasaRes.json();

    if (!nasaData.properties || !nasaData.properties.parameter) {
      throw new Error("NASA POWER: dữ liệu rỗng hoặc sai cấu trúc");
    }

    const weather = nasaData.properties.parameter;
    const safeGet = (param) => weather[param] && weather[param][day] !== undefined ? weather[param][day] : "--";

    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability,cloud_cover,visibility&timezone=auto&start_date=${dateInput}&end_date=${dateInput}`;
    const omRes = await fetch(omUrl);
    if (!omRes.ok) {
      throw new Error(`Meteo API error: ${omRes.status}`);
    }
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
        visibility: (dailyAvg(omData.hourly?.visibility || []) / 1000).toFixed(2),
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
  if (adviceUl) {
    adviceUl.innerHTML = "";
    adviceList.forEach(advice => {
      const li = document.createElement("li");
      li.textContent = advice;
      adviceUl.appendChild(li);
    });
  }
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
// 📊 Render Charts
// -------------------------------
function renderCharts(forecastData) {
  const days = forecastData.time || [];
  const normalizedAll = forecastData?.meteoData ? normalizeForecast(forecastData.meteoData) : {};

  const rainData = days.map(day => normalizedAll[day]?.maxRainProb || 0);
  const uvData = days.map(day => normalizedAll[day]?.maxUV || 0);

  // Destroy existing charts to prevent memory leaks
  if (window.rainChartInstance) {
    console.log("Destroying old rain chart instance");
    window.rainChartInstance.destroy();
  }
  if (window.uvChartInstance) {
    console.log("Destroying old UV chart instance");
    window.uvChartInstance.destroy();
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js is not loaded");
    return;
  }

  // Rain chart
  const rainCtx = document.getElementById("rainChart")?.getContext("2d");
  if (!rainCtx) {
    console.error("Canvas context for rainChart not found");
    return;
  }
  window.rainChartInstance = new Chart(rainCtx, {
    type: "line",
    data: {
      labels: days,
      datasets: [{
        label: "Rain Probability (%)",
        data: rainData,
        borderColor: "dodgerblue",
        backgroundColor: "rgba(30,144,255,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "dodgerblue"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: "%" } } }
    }
  });

  // UV chart
  const uvCtx = document.getElementById("uvChart")?.getContext("2d");
  if (!uvCtx) {
    console.error("Canvas context for uvChart not found");
    return;
  }
  window.uvChartInstance = new Chart(uvCtx, {
    type: "line",
    data: {
      labels: days,
      datasets: [{
        label: "UV Index",
        data: uvData,
        borderColor: "orange",
        backgroundColor: "rgba(255,165,0,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "orange"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true, title: { display: true, text: "UV Index" } } }
    }
  });
}

function showLoading() {
  document.getElementById("loading-spinner").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading-spinner").classList.add("hidden");
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

document.getElementById("date-picker").addEventListener("change", fetchWeatherForDate);

updateWeather("Hanoi");
updateDate();

const resizer = document.getElementById("resizer");
const leftPanel = document.getElementById("weather-info");
let isResizing = false;

resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "col-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  let newWidth = (e.clientX / window.innerWidth) * 100;
  if (newWidth > 15 && newWidth < 50) {
    leftPanel.style.width = newWidth + "%";
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.cursor = "default";
});

document.getElementById("download-csv-btn").addEventListener("click", async function () {
  if (currentLat === null || currentLon === null) {
    alert("⚠️ Please select a location first!");
    return;
  }
  const forecastData = await fetchForecastData(currentLat, currentLon);
  const normalized = normalizeForecast(forecastData.meteoData || {});

  let csvContent = "Date,Avg Temp (°C),Avg Humidity (%),Avg Wind (km/h),Max Rain Probability (%),Avg Cloud (%),Avg Visibility (km),Total Precipitation (mm),Max UV\n";

  Object.keys(normalized).slice(0, 7).forEach(day => {
    const d = normalized[day] || {};
    csvContent += `${day},${Math.round(d.avgTemp) || "--"},${Math.round(d.avgHumidity) || "--"},${Math.round(d.avgWind) || "--"},${Math.round(d.maxRainProb) || "--"},${Math.round(d.avgCloud) || "--"},${d.avgVisibility?.toFixed(2) || "--"},${d.totalPrecipitation || "--"},${d.maxUV?.toFixed(1) || "--"}\n`;
  });

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", currentCity + "_7days.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Toggle show/hide charts
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-chart-btn");
  const chartsContainer = document.getElementById("charts-container");

  if (toggleBtn && chartsContainer) {
    toggleBtn.addEventListener("click", () => {
      if (chartsContainer.style.display === "none") {
        chartsContainer.style.display = "block";
        toggleBtn.textContent = "Hide Charts";
      } else {
        chartsContainer.style.display = "none";
        toggleBtn.textContent = "Show Charts";
      }
    });
  }
});