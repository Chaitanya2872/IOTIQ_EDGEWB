import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMapComponent.css';
import L from 'leaflet';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  value: number;
  type: 'facility' | 'sensor' | 'alert' | 'energy';
  status: 'active' | 'warning' | 'critical';
}

interface WorldMapProps {
  style?: React.CSSProperties;
}

const WorldMapComponent: React.FC<WorldMapProps> = ({ style }) => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Highlighted regions with modern styling
  useEffect(() => {
    const sampleLocations: LocationData[] = [
      // INDIA - Major cities and tech hubs
      { id: '1', name: 'New Delhi Hub', lat: 28.6139, lng: 77.2090, value: 94, type: 'facility', status: 'active' },
      { id: '2', name: 'Mumbai Financial Center', lat: 19.0760, lng: 72.8777, value: 89, type: 'facility', status: 'active' },
      { id: '3', name: 'Bangalore Tech Valley', lat: 12.9716, lng: 77.5946, value: 96, type: 'facility', status: 'active' },
      { id: '4', name: 'Hyderabad Cyberabad', lat: 17.3850, lng: 78.4867, value: 91, type: 'sensor', status: 'active' },
      { id: '5', name: 'Chennai Auto Hub', lat: 13.0827, lng: 80.2707, value: 87, type: 'energy', status: 'warning' },
      { id: '6', name: 'Kolkata Trade Center', lat: 22.5726, lng: 88.3639, value: 83, type: 'facility', status: 'active' },
      
      // EUROPE - Major European cities
      { id: '7', name: 'London Financial District', lat: 51.5074, lng: -0.1278, value: 92, type: 'facility', status: 'active' },
      { id: '8', name: 'Paris Innovation Hub', lat: 48.8566, lng: 2.3522, value: 88, type: 'facility', status: 'active' },
      { id: '9', name: 'Berlin Tech Center', lat: 52.5200, lng: 13.4050, value: 90, type: 'sensor', status: 'active' },
      { id: '10', name: 'Amsterdam Data Center', lat: 52.3676, lng: 4.9041, value: 85, type: 'facility', status: 'warning' },
      { id: '11', name: 'Stockholm Green Energy', lat: 59.3293, lng: 18.0686, value: 94, type: 'energy', status: 'active' },
      { id: '12', name: 'Madrid Operations', lat: 40.4168, lng: -3.7038, value: 82, type: 'facility', status: 'active' },
      
      // ITALY - Key Italian cities
      { id: '13', name: 'Milan Fashion Tech', lat: 45.4642, lng: 9.1900, value: 89, type: 'facility', status: 'active' },
      { id: '14', name: 'Rome Heritage Center', lat: 41.9028, lng: 12.4964, value: 86, type: 'sensor', status: 'warning' },
      { id: '15', name: 'Florence Art Tech', lat: 43.7696, lng: 11.2558, value: 91, type: 'facility', status: 'active' },
      { id: '16', name: 'Naples Research Hub', lat: 40.8518, lng: 14.2681, value: 78, type: 'facility', status: 'critical' },
      
      // CANADA - Major Canadian cities
      { id: '17', name: 'Toronto Finance Hub', lat: 43.6532, lng: -79.3832, value: 93, type: 'facility', status: 'active' },
      { id: '18', name: 'Vancouver Tech Coast', lat: 49.2827, lng: -123.1207, value: 90, type: 'facility', status: 'active' },
      { id: '19', name: 'Montreal AI Center', lat: 45.5017, lng: -73.5673, value: 88, type: 'sensor', status: 'active' },
      { id: '20', name: 'Calgary Energy Hub', lat: 51.0447, lng: -114.0719, value: 85, type: 'energy', status: 'warning' },
      { id: '21', name: 'Ottawa Government Tech', lat: 45.4215, lng: -75.6972, value: 87, type: 'facility', status: 'active' },
      
      // CHINA - Major Chinese cities
      { id: '22', name: 'Beijing Innovation District', lat: 39.9042, lng: 116.4074, value: 95, type: 'facility', status: 'active' },
      { id: '23', name: 'Shanghai Financial Zone', lat: 31.2304, lng: 121.4737, value: 97, type: 'facility', status: 'active' },
      { id: '24', name: 'Shenzhen Tech Valley', lat: 22.3193, lng: 114.1694, value: 94, type: 'sensor', status: 'active' },
      { id: '25', name: 'Guangzhou Manufacturing', lat: 23.1291, lng: 113.2644, value: 89, type: 'facility', status: 'warning' },
      { id: '26', name: 'Hangzhou Digital Hub', lat: 30.2741, lng: 120.1551, value: 92, type: 'facility', status: 'active' },
      { id: '27', name: 'Chengdu Research Center', lat: 30.5728, lng: 104.0668, value: 86, type: 'energy', status: 'active' },
    ];

    setLocations(sampleLocations);

    // Simulate dynamic updates
    const interval = setInterval(() => {
      setLocations(prev => 
        prev.map(loc => ({
          ...loc,
          value: Math.max(30, Math.min(100, loc.value + (Math.random() - 0.5) * 10)),
          status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'active'
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMarkerColor = (location: LocationData) => {
    return '#d4af37'; // Royal golden for all markers
  };

  const getCircleRadius = (location: LocationData) => {
    return (location.value / 100) * 50000 + 20000; // Scale based on value
  };

  const createCustomIcon = (location: LocationData) => {
    const color = getMarkerColor(location);
    // Royal golden pulse for all markers
    const pulseColor = 'rgba(212, 175, 55, 0.4)';
    
    return L.divIcon({
      html: `
        <div class="modern-marker-container">
          <div class="pulse-ring" style="background-color: ${pulseColor};"></div>
          <div class="modern-dot" style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: 
              radial-gradient(circle at 30% 30%, 
                #f4d03f 0%, 
                #d4af37 50%, 
                #b7950b 100%);
            border: 2px solid #000000;
            box-shadow: 
              0 0 0 3px ${pulseColor},
              0 4px 15px rgba(212, 175, 55, 0.6),
              0 0 25px rgba(212, 175, 55, 0.3),
              inset 0 1px 2px rgba(255, 255, 255, 0.3);
            position: relative;
            z-index: 10;
          ">
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: 'modern-marker'
    });
  };

  return (
    <div style={style}>
      <MapContainer
        center={[35, 25]} // Optimized center to show highlighted regions
        zoom={2}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        className="world-map-container"
      >
        {/* Royal Light themed tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          className="royal-golden-map-layer"
        />

        {locations.map((location) => (
          <React.Fragment key={location.id}>
            {/* Pulsing circle to show activity */}
            <Circle
              center={[location.lat, location.lng]}
              radius={getCircleRadius(location)}
              pathOptions={{
                color: '#d4af37',
                fillColor: '#d4af37',
                fillOpacity: 0.1,
                weight: 1,
                opacity: 0.3,
              }}
            />
            
            {/* Location marker */}
            <Marker
              position={[location.lat, location.lng]}
              icon={createCustomIcon(location)}
              eventHandlers={{
                click: () => setSelectedLocation(location),
              }}
            >
              <Popup>
                <div style={{ 
                  color: '#d4af37', 
                  padding: '8px', 
                  background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                  borderRadius: '8px',
                  border: '1px solid #d4af37'
                }}>
                  <strong style={{ color: '#f4d03f', fontSize: '14px' }}>{location.name}</strong>
                  <br />
                  <span style={{ color: '#d4af37', fontSize: '12px' }}>
                    {location.type} Facility
                  </span>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>



      {/* Royal Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.9))',
        color: '#b8941f',
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 8px 25px rgba(212, 175, 55, 0.2)',
        border: '2px solid #d4af37',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#d4af37', fontSize: '14px' }}>
          🏛️ Royal Network
        </div>
        <div style={{ fontSize: '11px', color: '#b8941f' }}>
          <span style={{ color: '#d4af37', fontSize: '16px' }}>●</span> {locations.length} Global Facilities
        </div>
      </div>


    </div>
  );
};

export default WorldMapComponent;