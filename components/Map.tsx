'use client';

import { useEffect, useRef, useState } from 'react';
import type { SensorReading, AlertPreferences } from '@/types/models';

interface MapProps {
  readings: SensorReading[];
  preferences?: AlertPreferences | null;
  selectedMetric: string;
}

export default function Map({ readings, preferences, selectedMetric }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedReading, setSelectedReading] = useState<SensorReading | null>(null);
  const [useMapbox, setUseMapbox] = useState(false);

  // Check if Mapbox token is available
  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    setUseMapbox(!!mapboxToken);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapLoaded) return;

    const initMap = async () => {
      if (useMapbox) {
        await initMapboxMap();
      } else {
        await initLeafletMap();
      }
    };

    initMap();

    // Cleanup function to properly dispose of map instances
    return () => {
      if (map.current) {
        if (useMapbox) {
          map.current.remove();
        } else {
          map.current.remove();
        }
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [useMapbox, mapLoaded]);

  // Update map data when readings change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    if (useMapbox) {
      updateMapboxData();
    } else {
      updateLeafletData();
    }
  }, [readings, selectedMetric, mapLoaded, useMapbox]);

  const initMapboxMap = async () => {
    try {
      const mapboxgl = await import('mapbox-gl');
      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [31.0522, -17.8292], // Lake Chivero
        zoom: 12,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        addMapboxSources();
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.default.NavigationControl());
      map.current.addControl(new mapboxgl.default.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }));

    } catch (error) {
      console.error('Failed to load Mapbox, falling back to Leaflet:', error);
      setUseMapbox(false);
    }
  };

  const initLeafletMap = async () => {
    try {
      const L = await import('leaflet');
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      map.current = L.map(mapContainer.current!, {
        center: [-17.8292, 31.0522], // Lake Chivero
        zoom: 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);

      setMapLoaded(true);
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
    }
  };

  const addMapboxSources = () => {
    if (!map.current) return;

    // Add data source for points
    map.current.addSource('readings', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'heatmap',
      type: 'heatmap',
      source: 'readings',
      maxzoom: 15,
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
      }
    });

    // Add cluster layers
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'readings',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd3',
          10, '#f1f075',
          30, '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10, 30,
          30, 40
        ]
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'readings',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // Add unclustered points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'readings',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['get', 'isAnomaly'],
          '#ef4444',
          '#3b82f6'
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Add click handlers
    map.current.on('click', 'unclustered-point', (e: any) => {
      const reading = e.features[0].properties;
      setSelectedReading({
        ...reading,
        timestamp: reading.timestamp,
        latitude: e.features[0].geometry.coordinates[1],
        longitude: e.features[0].geometry.coordinates[0],
      });
    });

    map.current.on('click', 'clusters', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('readings').getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        map.current.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
    });
  };

  const updateMapboxData = () => {
    if (!map.current || !readings.length) return;

    const features = readings
      .filter(reading => reading.latitude && reading.longitude)
      .map(reading => ({
        type: 'Feature',
        properties: {
          ...reading,
          intensity: getIntensity(reading),
        },
        geometry: {
          type: 'Point',
          coordinates: [reading.longitude!, reading.latitude!]
        }
      }));

    map.current.getSource('readings').setData({
      type: 'FeatureCollection',
      features
    });
  };

  const updateLeafletData = async () => {
    if (!map.current || !readings.length) return;

    const L = await import('leaflet');
    
    // Clear existing markers
    map.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.current.removeLayer(layer);
      }
    });

    // Add new markers
    readings
      .filter(reading => reading.latitude && reading.longitude)
      .forEach(reading => {
        const isAnomaly = reading.isAnomaly || (preferences && isReadingAnomalous(reading, preferences));
        
        const marker = L.marker([reading.latitude!, reading.longitude!], {
          icon: L.divIcon({
            className: `custom-marker ${isAnomaly ? 'anomaly' : 'normal'}`,
            html: `<div class="marker-dot ${isAnomaly ? 'bg-red-500' : 'bg-blue-500'}"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        });

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${reading.locationName || 'Reading'}</h3>
            <p class="text-sm text-gray-600">${new Date(reading.timestamp).toLocaleString()}</p>
            <div class="mt-2 space-y-1 text-sm">
              <div>Temperature: ${reading.temperature.toFixed(1)}°C</div>
              <div>pH: ${reading.phLevel.toFixed(1)}</div>
              <div>DO: ${reading.dissolvedOxygen.toFixed(1)} mg/L</div>
              <div>Turbidity: ${reading.turbidity.toFixed(1)} NTU</div>
            </div>
            ${isAnomaly ? '<div class="mt-2 text-red-600 text-sm font-medium">⚠️ Anomaly detected</div>' : ''}
          </div>
        `);

        marker.addTo(map.current);
      });
  };

  const getIntensity = (reading: SensorReading): number => {
    if (!preferences) return reading.isAnomaly ? 1 : 0.3;
    
    let intensity = 0;
    
    // pH intensity
    if (reading.phLevel < preferences.phMin || reading.phLevel > preferences.phMax) {
      intensity += 0.3;
    }
    
    // Turbidity intensity
    if (reading.turbidity > preferences.turbidityMax) {
      intensity += 0.3;
    }
    
    // Dissolved oxygen intensity
    if (reading.dissolvedOxygen < preferences.dissolvedOxygenMin) {
      intensity += 0.3;
    }
    
    // Base anomaly flag
    if (reading.isAnomaly) {
      intensity += 0.4;
    }
    
    return Math.min(intensity, 1);
  };

  const isReadingAnomalous = (reading: SensorReading, prefs: AlertPreferences): boolean => {
    return (
      reading.phLevel < prefs.phMin ||
      reading.phLevel > prefs.phMax ||
      reading.turbidity > prefs.turbidityMax ||
      reading.dissolvedOxygen < prefs.dissolvedOxygenMin
    );
  };

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Map type indicator */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-gray-600">
        {useMapbox ? 'Mapbox GL' : 'OpenStreetMap'}
      </div>

      {/* Reading details drawer */}
      {selectedReading && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 max-w-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900">
              {selectedReading.locationName || 'Water Reading'}
            </h3>
            <button
              onClick={() => setSelectedReading(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            {new Date(selectedReading.timestamp).toLocaleString()}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-semibold text-blue-600">
                {selectedReading.temperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-600">Temperature</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-semibold text-green-600">
                {selectedReading.phLevel.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">pH Level</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="text-lg font-semibold text-orange-600">
                {selectedReading.dissolvedOxygen.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">DO (mg/L)</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="text-lg font-semibold text-purple-600">
                {selectedReading.turbidity.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Turbidity (NTU)</div>
            </div>
          </div>
          
          {selectedReading.isAnomaly && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
              <div className="flex items-center text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                </svg>
                Anomaly detected
              </div>
            </div>
          )}
          
          <button 
            onClick={() => {
              // Navigate to report form with pre-filled location
              window.location.href = `/reports/new?lat=${selectedReading.latitude}&lng=${selectedReading.longitude}`;
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Report Issue Here
          </button>
        </div>
      )}

      {/* CSS for Leaflet markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .marker-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}