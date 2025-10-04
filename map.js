const HANOI_COORDS = [21.0285, 105.8542];
const HANOI_ZOOM_LEVEL = 12;
const MIN_ZOOM_LEVEL = 5;

// Initialize map with a broader view to include all markers
const map = L.map("map").setView([15, 110], 5);

// Add Esri tile layer
var topo = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri",
    maxZoom: 17,
    minZoom: MIN_ZOOM_LEVEL,
  }
).addTo(map); // Mặc định bật

// Bản đồ Imagery
var imagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri",
    maxZoom: 17,
    minZoom: MIN_ZOOM_LEVEL,
  }
);

// Thêm control để chọn layer
var baseMaps = {
    "Topo Map": topo,
    "World Imagery": imagery
};

L.control.layers(baseMaps).addTo(map);

// Define custom icon (used for both static markers and search results)
const redIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -30],
});

// Add markers
const hoangSaMarker = L.marker([16.5, 112], { icon: redIcon })
  .bindTooltip("Đặc khu Hoàng Sa", {
    permanent: true,
    direction: "right",
    className: "custom-label",
  })
  .addTo(map);

const truongSaMarker = L.marker([10.5, 114], { icon: redIcon })
  .bindTooltip("Đặc khu Trường Sa", {
    permanent: true,
    direction: "right",
    className: "custom-label",
  })
  .addTo(map);

// Automatically adjust map to show all markers
const bounds = L.latLngBounds([HANOI_COORDS, [16.5, 112], [10.5, 114]]);
map.fitBounds(bounds, { padding: [50, 50] });

// Provider từ leaflet-geosearch
const provider = new GeoSearch.OpenStreetMapProvider();

// Tạo input search thủ công
const searchBox = document.createElement("input");
searchBox.type = "text";
searchBox.placeholder = "Search for a city in Vietnam";
searchBox.style.width = "96.38%";
searchBox.style.padding = "6px";
searchBox.style.border = "1px solid #ccc";
searchBox.style.borderRadius = "4px";
searchBox.style.marginBottom = "10px";

// Chèn vào trong #weather-info (ngay trên đầu)
const panel = document.getElementById("weather-info");
panel.insertBefore(searchBox, panel.firstChild);

let currentMarker = null; // lưu marker hiện tại

// Khi search thành phố
searchBox.addEventListener("keydown", async function (e) {
  if (e.key === "Enter") {
    const query = searchBox.value;
    if (!query) return;

    const results = await provider.search({ query: query });
    if (results.length > 0) {
      const { x, y, label } = results[0]; // x=lng, y=lat
      map.setView([y, x], 10);

      // xóa marker cũ nếu có
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      // tạo marker mới
      currentMarker = L.marker([y, x], { icon: redIcon })
        .addTo(map)
        .bindPopup(label)
        .openPopup();

      // Cập nhật thời tiết cho vị trí được tìm kiếm
      await updateWeatherFromCoords(y, x, label);
    }
  }
});

// Nhóm layer để chứa các vùng đã vẽ
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Thêm control vẽ + edit (bao gồm xóa)
const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,   // Cho phép vẽ polygon
    rectangle: true, // Cho phép vẽ hình chữ nhật
    circle: true,    // Cho phép vẽ circle
    marker: false,
    polyline: false,
    circlemarker: true
  },
  edit: {
    featureGroup: drawnItems, // Cho phép chỉnh sửa và xóa vùng
    remove: true              // Nút xóa
  }
});
map.addControl(drawControl);

// Khi user vẽ xong
map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer;
  drawnItems.addLayer(layer);

  // Nếu muốn tính centroid để gọi API thời tiết
  if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
    const latlngs = layer.getLatLngs()[0];
    const lat = latlngs.reduce((sum, p) => sum + p.lat, 0) / latlngs.length;
    const lng = latlngs.reduce((sum, p) => sum + p.lng, 0) / latlngs.length;
    updateWeatherFromCoords(lat, lng, "Selected Area (avg)");
  } else if (layer instanceof L.Circle) {
    const { lat, lng } = layer.getLatLng();
    updateWeatherFromCoords(lat, lng, "Selected Area (avg)");
  } else if (layer instanceof L.CircleMarker) {
    const { lat, lng } = layer.getLatLng();
    updateWeatherFromCoords(lat, lng, `(${lat.toFixed(2)}, ${lng.toFixed(2)})`);
  }
});

// Khi user xóa vùng
map.on(L.Draw.Event.DELETED, function (event) {
  const layers = event.layers;
  layers.eachLayer(function (layer) {
    drawnItems.removeLayer(layer);
  });

  // Reset thông tin khi xóa vùng
  document.getElementById("city-name").innerText = "No Area Selected";
  document.getElementById("temp").innerText = "-- °C";
  document.getElementById("humidity").innerText = "--%";
  document.getElementById("advice-list").innerHTML = "";
});