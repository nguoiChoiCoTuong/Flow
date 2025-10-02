const HANOI_COORDS = [21.0285, 105.8542];
const HANOI_ZOOM_LEVEL = 12;
const MIN_ZOOM_LEVEL = 5;

// Initialize map with a broader view to include all markers
const map = L.map("map").setView([15, 110], 5);

// Add Esri tile layer
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri",
    maxZoom: 19,
    minZoom: MIN_ZOOM_LEVEL,
  }
).addTo(map);

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

// Add search control using OpenStreetMap provider with customizations
const provider = new GeoSearch.OpenStreetMapProvider();
const searchControl = new GeoSearch.GeoSearchControl({
  provider: provider,
  style: 'bar', // Keep as search bar
  position: 'topright', // Move to top-right corner
  searchLabel: 'Search for a city in Vietnam', // Custom placeholder
  autoComplete: false, // Disable autocomplete for faster searches
  showMarker: true, // Show a marker at the searched location
  marker: {
    icon: redIcon, // Use the same red icon for search results
    draggable: false,
  },
  retainZoomLevel: false, // Zoom to the searched location
  animateZoom: true,
  autoClose: true, // Close the search results after selection
  keepResult: false, // Remove the marker after new search
});

map.addControl(searchControl);

// Event listener to zoom to searched location
map.on('geosearch/showlocation', function (e) {
  map.setView([e.location.y, e.location.x], HANOI_ZOOM_LEVEL);
});