import { backend_domain } from "@/global/env";
import type {
  CreateCheckoutSessionRequest,
  CreateCheckOutSessionResponse,
} from "./ride-api-type";
import { useMutation } from "@tanstack/react-query";

export function useCreateRideRequest() {
  const createRideRequest = async (
    data: CreateCheckoutSessionRequest,
  ): Promise<CreateCheckOutSessionResponse> => {
    console.log(data);
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
