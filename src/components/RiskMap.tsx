"use client";

import { useState, useMemo } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertTriangle, MapPin } from 'lucide-react';
import { RiskEvent } from '@/lib/api';

// Map DB District IDs to Lat/Long since we didn't populate full GeoJSON polygons in the seed
const geoMap: Record<string, { lat: number, lng: number, name: string }> = {
  '33333333-3333-4a7b-a259-2c7075775f60': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  '33333333-3333-4a7b-a259-2c7075775f61': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  '33333333-3333-4a7b-a259-2c7075775f62': { lat: 28.7041, lng: 77.1025, name: 'Delhi' }
};

export default function RiskMap({ risks }: { risks: RiskEvent[] }) {
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4.5
  });
  const [popupInfo, setPopupInfo] = useState<any>(null);

  // Group risks by location for map markers
  const clusteredRisks = useMemo(() => {
    const clusters: Record<string, { location: any, risks: RiskEvent[], maxSeverity: string }> = {};
    
    risks.forEach(risk => {
      const loc = geoMap[risk.geography_id];
      if (!loc) return;
      
      if (!clusters[risk.geography_id]) {
        clusters[risk.geography_id] = { location: loc, risks: [], maxSeverity: 'Normal' };
      }
      clusters[risk.geography_id].risks.push(risk);
      
      // Determine highest severity for marker color
      if (risk.severity === 'Critical') clusters[risk.geography_id].maxSeverity = 'Critical';
      else if (risk.severity === 'High' && clusters[risk.geography_id].maxSeverity !== 'Critical') clusters[risk.geography_id].maxSeverity = 'High';
      else if (risk.severity === 'Medium' && !['Critical', 'High'].includes(clusters[risk.geography_id].maxSeverity)) clusters[risk.geography_id].maxSeverity = 'Medium';
    });
    
    return Object.values(clusters);
  }, [risks]);

  const getColor = (severity: string) => {
    if (severity === 'Critical') return '#ef4444'; // red-500
    if (severity === 'High') return '#f97316'; // orange-500
    if (severity === 'Medium') return '#eab308'; // yellow-500
    return '#3b82f6'; // blue-500
  };

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    >
      <NavigationControl position="top-right" />
      
      {clusteredRisks.map((cluster, idx) => (
        <Marker 
          key={idx}
          longitude={cluster.location.lng} 
          latitude={cluster.location.lat}
          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo(cluster);
          }}
        >
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse"
            style={{ backgroundColor: getColor(cluster.maxSeverity) }}
          >
            <AlertTriangle size={16} color="white" />
          </div>
        </Marker>
      ))}

      {popupInfo && (
        <Popup
          longitude={popupInfo.location.lng}
          latitude={popupInfo.location.lat}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
          className="rounded-xl overflow-hidden"
          maxWidth="300px"
        >
          <div className="p-1 text-slate-800">
            <h3 className="font-bold text-lg border-b pb-2 mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" />
              {popupInfo.location.name}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {popupInfo.risks.map((risk: RiskEvent) => (
                <div key={risk.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{risk.type}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${risk.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{risk.domain}</span>
                    <span className="font-mono">{risk.data_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}
