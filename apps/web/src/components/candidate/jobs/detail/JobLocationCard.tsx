'use client';

import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface JobLocationCardProps {
  locationCity?: string | null;
  locationProvince?: string | null;
  locationAddress?: string | null;
}

interface Coordinates {
  longitude: number;
  latitude: number;
}

export default function JobLocationCard({
  locationCity,
  locationProvince,
  locationAddress,
}: JobLocationCardProps) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Format location string
  const getLocationString = () => {
    const parts = [];
    if (locationAddress) parts.push(locationAddress);
    if (locationCity) parts.push(locationCity);
    if (locationProvince && locationProvince !== locationCity) parts.push(locationProvince);
    return parts.join(', ') || 'Location not specified';
  };

  const locationString = getLocationString();
  console.log(locationString);

  // Generate Google Maps URL for the location
  const getMapUrl = () => {
    const query = encodeURIComponent(locationString);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Geocode address using Mapbox Geocoding API
  useEffect(() => {
    if (!MAPBOX_TOKEN || locationString === 'Location not specified') return;

    setGeocoding(true);
    const query = encodeURIComponent(locationString);
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=vi`
    )
      .then((res) => res.json())
      .then((data) => {
        const feature = data?.features?.[0];
        if (feature) {
          const [lng, lat] = feature.center;
          setCoords({ longitude: lng, latitude: lat });
        }
      })
      .catch(() => {})
      .finally(() => setGeocoding(false));
  }, [locationString]);

  return (
    <div className="shadow-sophisticated overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        <h3 className="font-bold">Location</h3>
        <p className="mt-1 text-xs text-slate-500">{locationString}</p>
      </div>

      {/* Map */}
      <div className="relative h-48 w-full">
        {geocoding && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="text-xs text-slate-400">Loading map...</div>
          </div>
        )}

        {coords && !geocoding ? (
          <Map
            initialViewState={{
              longitude: coords.longitude,
              latitude: coords.latitude,
              zoom: 14,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            scrollZoom={false}
            dragPan={false}
          >
            <NavigationControl position="top-right" showCompass={false} />

            <Marker longitude={coords.longitude} latitude={coords.latitude} anchor="bottom">
              <div className="relative flex flex-col items-center">
                {/* Ping animation */}
                <div className="bg-primary/30 absolute -top-1 size-8 animate-ping rounded-full" />
                {/* Pin body */}
                <div className="bg-primary relative flex size-10 items-center justify-center rounded-full border-[3px] border-white shadow-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.741 19.58 19.58 0 002.683-2.282c1.944-2.083 3.218-4.568 3.218-7.327a7.5 7.5 0 10-15 0c0 2.76 1.274 5.244 3.218 7.327a19.579 19.579 0 002.682 2.282 16.975 16.975 0 001.144.74zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Pin tail */}
                <div className="bg-primary h-2 w-[3px] rounded-b-full shadow-md" />
              </div>
            </Marker>
          </Map>
        ) : (
          !geocoding && (
            <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800">
              <p className="text-xs text-slate-400">Map unavailable</p>
            </div>
          )
        )}

        {/* View on Google Maps Button */}
        <a
          href={getMapUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-primary absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-lg transition-all hover:scale-105 hover:text-white"
        >
          <span className="material-symbols-outlined text-base">map</span>
          View on Map
        </a>
      </div>
    </div>
  );
}
