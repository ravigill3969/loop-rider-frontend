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
