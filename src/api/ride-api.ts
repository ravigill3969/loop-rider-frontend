import { backend_domain } from "@/global/env";
import type {
  ActiveTrip,
  ActiveRideIdResponse,
  CreateCheckoutSessionRequest,
  CreateCheckOutSessionResponse,
  CancelRideI,
} from "./ride-api-type";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateRideRequest() {
  const createRideRequest = async (
    data: CreateCheckoutSessionRequest,
  ): Promise<CreateCheckOutSessionResponse> => {
    const response = await fetch(
      `${backend_domain}/api/payment/create-checkout-session`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res = await response.json();

    if (!response.ok) {
      throw new Error("fuck");
    }

    return res;
  };

  const mutate = useMutation({
    mutationKey: ["createRideRequest"],
    mutationFn: createRideRequest,
    onSuccess: (res) => {
      window.location.href = res.checkout_url;
    },
  });

  return mutate;
}

//get ride id
export function useGetActiveRideRequest() {
  const getActiveRideRequest = async (): Promise<ActiveRideIdResponse> => {
    const response = await fetch(
      `${backend_domain}/api/trip/get-active-ride-id`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const res = await response.json();

    if (!response.ok) {
      throw new Error("fuck");
    }

    return res;
  };

  const query = useQuery({
    queryKey: ["getActiveRideRequest"],
    queryFn: getActiveRideRequest,
  });

  return query;
}

//get ride with id
export function useGetActiveRideRequestWithID(tid: string) {
  const getActiveRideWithID = async (): Promise<ActiveTrip> => {
    const response = await fetch(
      `${backend_domain}/api/trip/get-active-ride/?tid=${tid}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const res = await response.json();

    if (!response.ok) {
      throw new Error("fuck");
    }

    return res;
  };
  const query = useQuery({
    queryKey: ["getActiveRideWithID"],
    queryFn: getActiveRideWithID,
    enabled: !!tid,
  });

  return query;
}

export function useCancelRide() {
  const cancelRideReq = async (
    data: CancelRideI,
  ): Promise<CreateCheckOutSessionResponse> => {
    const response = await fetch(`${backend_domain}/api/trip/cancel-ride`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new Error("fuck");
    }

    return res;
  };

  const mutate = useMutation({
    mutationKey: ["cancelRideReq"],
    mutationFn: cancelRideReq,
  });

  return mutate;
}
