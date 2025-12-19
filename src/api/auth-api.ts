import { backend_domain } from "@/global/env";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { UserResponse } from "./auth-api-types";

export function useLogin() {
  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string> => {
    const response = await fetch(`${backend_domain}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new Error("Internal server error");
    }

    return res;
  };

  const mutate = useMutation({
    mutationFn: login,
    mutationKey: ["login"],
  });

  return mutate;
}

export function useGetRiderInfo() {
  const getRiderInfo = async (): Promise<UserResponse> => {
    const response = await fetch(`${backend_domain}/api/auth/rider`, {
      method: "GET",
      credentials: "include",
    });

    const res = await response.json();

    console.log(res);

    if (!response.ok) {
      throw new Error(res.message);
    }

    return res;
  };

  const query = useQuery({
    queryKey: ["getRiderInfo"],
    queryFn: getRiderInfo,
    retry: false,
  });

  return query;
}
