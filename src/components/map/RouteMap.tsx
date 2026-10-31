import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { db } from '../../services/db';
import { getPrimaryRoute, getAlternativeBypassRoute } from '../../services/routing';

interface RouteMapProps {
  className?: string;
  showAlternativeRoute?: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({ className = '', showAlternativeRoute = true }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const checkpointMarkersRef = useRef<L.Marker[]>([]);
  const primaryPolylineRef = useRef<L.Polyline | null>(null);
  const alternatePolylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center between Hospital A and Hospital B
    const map = L.map(mapContainerRef.current, {
      center: [28.6100, 77.2270],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    // Dark styled OpenStreetMap tiles via CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Draw Primary Route
    const primaryRoute = getPrimaryRoute();
    const primaryCoords: [number, number][] = primaryRoute.waypoints.map(w => [w.lat, w.lng]);
    const primaryLine = L.polyline(primaryCoords, {
      color: '#0284c7', // Sky-600
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    primaryPolylineRef.current = primaryLine;

    // Draw Alternative Bypass Route
    const altRoute = getAlternativeBypassRoute();
    const altCoords: [number, number][] = altRoute.waypoints.map(w => [w.lat, w.lng]);
    const altLine = L.polyline(altCoords, {
      color: '#f59e0b', // Amber-500
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.75
    }).addTo(map);
    alternatePolylineRef.current = altLine;

    // Add Hospital A Marker
    const hospA = db.hospitals[0];
    const hospAIcon = L.divIcon({
      className: 'custom-hosp-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-lg bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
            H-A
          </div>
          <span class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-blue-300 text-[10px] px-1.5 py-0.5 rounded border border-blue-800 shadow">
            Metro General
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([hospA.lat, hospA.lng], { icon: hospAIcon }).addTo(map).bindPopup('<b>Hospital A (Sending)</b><br>Metro City General Hospital');

    // Add Hospital B Marker
    const hospB = db.hospitals[1];
    const hospBIcon = L.divIcon({
      className: 'custom-hosp-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-lg bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs animate-pulse">
            H-B
          </div>
          <span class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-800 shadow">
            Apex Trauma (Receiving)
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([hospB.lat, hospB.lng], { icon: hospBIcon }).addTo(map).bindPopup('<b>Hospital B (Receiving)</b><br>Apex Trauma & Research Institute');

    // Add Checkpoint Markers
    checkpointMarkersRef.current = db.checkpoints.map(cp => {
      const getLedBadge = () => {
        if (cp.ledState === 'CHECKPOINT_ACTIVE') {
          return `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <div class="relative w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow flex items-center justify-center text-white font-black text-[11px]">
                    CP${cp.junctionNumber}
                  </div>`;
        }
        if (cp.isPassed) {
          return `<div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow flex items-center justify-center text-white font-bold text-[11px]">
                    ✓
                  </div>`;
        }
        return `<div class="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-500 shadow flex items-center justify-center text-slate-300 font-medium text-[11px]">
                  ${cp.junctionNumber}
                </div>`;
      };

      const icon = L.divIcon({
        className: 'custom-checkpoint-marker',
        html: `
          <div class="relative flex items-center justify-center">
            ${getLedBadge()}
            <span class="absolute -top-5 whitespace-nowrap bg-slate-900/90 text-slate-200 text-[9px] px-1 py-0.5 rounded border border-slate-700">
              J${cp.junctionNumber} (GPIO ${cp.ledPin})
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      return L.marker([cp.lat, cp.lng], { icon }).addTo(map).bindPopup(`<b>${cp.name}</b><br>LED Pin: GPIO ${cp.ledPin}<br>State: ${cp.ledState}`);
    });

    // Add Ambulance Marker
    const activeAmb = db.ambulances[0];
    const ambIcon = L.divIcon({
      className: 'custom-amb-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs animate-bounce">
            🚑
          </div>
          <span class="absolute -bottom-5 whitespace-nowrap bg-red-950/95 text-red-200 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-red-700 shadow">
            AMB-101 (Active)
          </span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    const ambMarker = L.marker([activeAmb.currentLat, activeAmb.currentLng], { icon: ambIcon, zIndexOffset: 1000 }).addTo(map);
    ambulanceMarkerRef.current = ambMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when state changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      if (!mapInstanceRef.current) return;

      // Update Ambulance Marker position
      const amb = db.ambulances.find(a => a.id === db.activeTransfer?.assignedAmbulanceId) || db.ambulances[0];
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.setLatLng([amb.currentLat, amb.currentLng]);
        if (db.activeTransfer?.status === 'route_active') {
          ambulanceMarkerRef.current.bindTooltip(
            `<b>${amb.id} (${amb.vehicleNumber})</b><br>Speed: ${amb.speedKmH} km/h<br>ETA: ${db.activeTransfer.currentEtaMinutes} mins`,
            { permanent: false, direction: 'top' }
          );
        }
      }

      // Update Checkpoint Markers
      db.checkpoints.forEach((cp, idx) => {
        const marker = checkpointMarkersRef.current[idx];
        if (!marker) return;

        let badgeHtml = '';
        if (cp.ledState === 'CHECKPOINT_ACTIVE') {
          badgeHtml = `
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <div class="relative w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
              J${cp.junctionNumber}
            </div>
          `;
        } else if (cp.isPassed) {
          badgeHtml = `
            <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow flex items-center justify-center text-white font-bold text-xs">
              ✓
            </div>
          `;
        } else if (cp.ledState === 'ROUTE_CANCELLED') {
          badgeHtml = `
            <div class="w-6 h-6 rounded-full bg-red-900 border-2 border-red-500 shadow flex items-center justify-center text-red-200 font-bold text-[10px] line-through">
              J${cp.junctionNumber}
            </div>
          `;
        } else {
          badgeHtml = `
            <div class="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 shadow flex items-center justify-center text-slate-300 font-medium text-[10px]">
              J${cp.junctionNumber}
            </div>
          `;
        }

        const updatedIcon = L.divIcon({
          className: 'custom-checkpoint-marker',
          html: `
            <div class="relative flex items-center justify-center">
              ${badgeHtml}
              <span class="absolute -top-5 whitespace-nowrap bg-slate-900/90 text-slate-200 text-[9px] px-1 py-0.5 rounded border border-slate-700">
                ${cp.name.split('(')[1]?.replace(')', '') || `J${cp.junctionNumber}`}
              </span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        marker.setIcon(updatedIcon);
      });

      // Update polylines highlight
      if (primaryPolylineRef.current && alternatePolylineRef.current) {
        if (db.activeTransfer?.isRerouted) {
          primaryPolylineRef.current.setStyle({ color: '#64748b', opacity: 0.4, weight: 3 });
          alternatePolylineRef.current.setStyle({ color: '#10b981', opacity: 0.95, weight: 6, dashArray: '' });
        } else {
          primaryPolylineRef.current.setStyle({ color: '#0284c7', opacity: 0.85, weight: 5 });
          alternatePolylineRef.current.setStyle({ color: '#f59e0b', opacity: 0.75, weight: 4, dashArray: '8, 8' });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

      {/* Map Overlay Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-xl text-xs space-y-1.5 max-w-[210px]">
        <div className="font-bold text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Emergency Corridor GIS
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3.5 h-1 bg-sky-500 rounded"></span>
          <span>Primary Route (J1-J4)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3.5 h-1 border-b-2 border-dashed border-amber-500"></span>
          <span>Bypass (Outer Ring Arc)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Active Clearance LED</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Ambulance Passed</span>
        </div>
      </div>
    </div>
  );
};
