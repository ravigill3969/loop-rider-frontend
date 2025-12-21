import React, { useState } from "react";
import mapboxgl from "mapbox-gl";
import { map_token } from "../global/env";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NavigationUI from "@/components/Nav";

mapboxgl.accessToken = map_token;

interface LocationResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromCoords, setFromCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [fromResults, setFromResults] = useState<LocationResult[]>([]);
  const [toResults, setToResults] = useState<LocationResult[]>([]);

  const navigate = useNavigate();

  // Canada only search   
  const searchCanada = async (
    query: string,
    setResults: React.Dispatch<React.SetStateAction<LocationResult[]>>
  ) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const url = `
      https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?country=ca&bbox=-141,41.7,-52.6,83.1&autocomplete=true&limit=5&access_token=${
      mapboxgl.accessToken
    }
    `;

    const res = await fetch(url);
    const data = await res.json();

    const simplified: LocationResult[] = data.features.map(
      (f: { id: string; place_name: string; center: number[] }) => ({
        id: f.id,
        name: f.place_name,
        lng: f.center[0],
        lat: f.center[1],
      })
    );

    setResults(simplified);
  };

  const goToNextPage = () => {
    if (!fromCoords || !toCoords) {
      alert("Please select both locations from the suggestions.");
      return;
    }

    localStorage.setItem("from", JSON.stringify(from));
    localStorage.setItem("to", JSON.stringify(to));
    localStorage.setItem("pickup_location", from);
    localStorage.setItem("dropoff_location", to);

    navigate("/ride", {
      state: {
        from: fromCoords,
        to: toCoords,
        pickup_location: from,
        dropoff_location: to,
      },
    });
  };

  return (
    <div>
      <NavigationUI />

      <div className="p-5 max-w-sm mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-4">Find a Ride</h2>

        <div className="relative w-full">
          <label className="text-sm font-medium">From:</label>

          <Input
            type="text"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              searchCanada(e.target.value, setFromResults);
            }}
            placeholder="Pickup location"
            className="mt-1"
          />

          {fromResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white rounded-md border border-gray-300 z-9999 max-h-44 overflow-y-auto mt-1 shadow">
              {fromResults.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setFrom(loc.name);
                    setFromCoords({ lat: loc.lat, lng: loc.lng });
                    setFromResults([]);
                  }}
                  className="p-3 cursor-pointer text-black border-b border-gray-200  hover:bg-gray-100"
                >
                  {loc.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TO INPUT */}
        <div className="relative w-full mt-5">
          <label className="text-sm font-medium">To:</label>

          <Input
            type="text"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              searchCanada(e.target.value, setToResults);
            }}
            placeholder="Dropoff location"
            className="w-full p-3 border rounded-md mt-1"
          />

          {toResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white rounded-md border border-gray-300 z-9999 max-h-44 overflow-y-auto mt-1 shadow">
              {toResults.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setTo(loc.name);
                    setToCoords({ lat: loc.lat, lng: loc.lng });
                    setToResults([]);
                  }}
                  className="p-3 cursor-pointer text-black border-b border-gray-200 hover:bg-gray-100"
                >
                  {loc.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={goToNextPage}
          className="mt-5 w-full p-3 bg-black text-white rounded-md cursor-pointer hover:bg-gray-900 transition"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default Home;
