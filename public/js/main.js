async function getGpsData() {
  return await fetch('/get')
}

document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  getGpsData().then((response) => {
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    response.json().then((gpsData) => {
      console.log(gpsData);
      gpsData.forEach(point => {
        L.marker([point.latitude, point.longitude]).addTo(map)
          .bindPopup(`Latitude: ${point.latitude}, Longitude: ${point.longitude}`)
          .openPopup();
      });
    });
  });
});
