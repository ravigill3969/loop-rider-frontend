export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CreateCheckoutSessionRequest {
  pickup_location: string;
  pickup_coords: Coordinates;

  dropoff_location: string;
  dropoff_coords: Coordinates;

  estimated_price: number;
  estimated_distance_km: number;
  estimated_duration_min: number;

  rider_name: string;
  rider_age: number;
  rider_gender: string;
}

export interface CreateCheckOutSessionResponse {
  success: boolean;
  checkout_url: string;
  session_id: string;
  status: string;
}

export interface ActiveTrip {
  trip_id: string;
  rider_id: string;
  payment_id: string;
  driver_id?: string;

  pickup_location: string;
  dropoff_location: string;

  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;

  estimated_distance_km: number;
  estimated_duration_min: number;
  estimated_price: number;

  status: "searching" | "accepted" | "completed" | "cancelled";
}

export interface ActiveRideIdResponse {
  status: boolean;
  trip_id: string | null;
}

export interface CancelRideI {
  trip_id: string;
  driver_id: string;
  reason: string;
}
