"use client";

import { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

const stateCoordinates: Record<string, { lat: number, lng: number, zoom: number }> = {
  'Maharashtra': { lat: 19.7515, lng: 75.7139, zoom: 6 },
  'Karnataka': { lat: 15.3173, lng: 75.7139, zoom: 6 },
  'Delhi': { lat: 28.7041, lng: 77.1025, zoom: 9 },
  'Gujarat': { lat: 22.2587, lng: 71.1924, zoom: 6 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, zoom: 6 },
  'India': { lat: 20.5937, lng: 78.9629, zoom: 4 }
};

export default function RegionMap({ regionName = 'India' }: { regionName?: string }) {
  const [viewState, setViewState] = useState({
    longitude: stateCoordinates['India'].lng,
    latitude: stateCoordinates['India'].lat,
    zoom: stateCoordinates['India'].zoom
  });

  useEffect(() => {
    const coords = stateCoordinates[regionName] || stateCoordinates['India'];
    setViewState({
      longitude: coords.lng,
      latitude: coords.lat,
      zoom: coords.zoom
    });
  }, [regionName]);

  // A completely FREE, open-source dark map style (CartoDB Dark Matter)
  const mapStyle = {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: '&copy; CARTO'
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative border border-slate-800">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle as any}
        style={{ width: '100%', height: '100%' }}
      >
        <Marker longitude={viewState.longitude} latitude={viewState.latitude}>
          <div className="bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 p-2 rounded-lg backdrop-blur-sm text-xs font-bold flex flex-col items-center shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer hover:scale-110 transition-transform">
            <span>{regionName}</span>
            <span className="text-[9px] font-normal text-emerald-200">Resilience: 82%</span>
          </div>
        </Marker>

        <Marker longitude={viewState.longitude + 0.5} latitude={viewState.latitude - 0.5}>
          <div className="bg-amber-500/20 border-2 border-amber-400 text-amber-400 p-2 rounded-lg backdrop-blur-sm text-xs font-bold flex flex-col items-center shadow-[0_0_15px_rgba(251,191,36,0.5)] cursor-pointer hover:scale-110 transition-transform">
            <span className="flex items-center gap-1"><MapPin size={10}/> Hotspot</span>
            <span className="text-[9px] font-normal text-amber-200">Traffic: High</span>
          </div>
        </Marker>
      </Map>
    </div>
  );
}
