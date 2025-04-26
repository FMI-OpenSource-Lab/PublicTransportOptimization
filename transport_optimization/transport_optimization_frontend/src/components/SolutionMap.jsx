import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const colors = [
  "#FF6666",
  "#6666FF",
  "#66FF66",
  "#9966FF",
  "#FF9966",
  "#66FFFF",
  "#FF66FF",
];


function SolutionMap({ solution }) {
  if (!solution || solution.length === 0) return null;

  const allStops = solution.flat();
  const validStops = allStops.filter(stop => stop.latitude !== undefined && stop.longitude !== undefined);

  if (validStops.length === 0) return null;

  const avgLat = validStops.reduce((sum, stop) => sum + stop.latitude, 0) / validStops.length;
  const avgLng = validStops.reduce((sum, stop) => sum + stop.longitude, 0) / validStops.length;

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer center={[avgLat, avgLng]} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {solution.map((route, idx) => (
          <Polyline
            key={idx}
            positions={route
              .filter(stop => stop.latitude !== undefined && stop.longitude !== undefined)
              .map(stop => [stop.latitude, stop.longitude])}
            color={colors[idx % colors.length]}
          />
        ))}
        {validStops.map((stop, idx) => (
          <Marker key={idx} position={[stop.latitude, stop.longitude]}>
            <Popup>{stop.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="flex flex-wrap gap-4 mt-4">
        {solution.map((route, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[idx % colors.length] }}
            ></div>
            <span className="text-sm font-medium">Route {idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SolutionMap;
