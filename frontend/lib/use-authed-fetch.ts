"use client";

import { useRouter } from "next/navigation";

/*
This function returns a function that fetches the current user from the API.
If the user is not authenticated, it redirects to the login page.
*/
export function useAuthedFetch() {
  const router = useRouter();

  // Return a function that fetches the current user from the API.
  return async function authedFetch() {
    // Fetch GET /users/me from the API.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
      {
        credentials: "include",
      }
    );

    console.log(response);

    if (response.status === 401) {
      router.replace("/login");
      console.debug("User is not authenticated, redirecting to login page");
    }

    return response.json();
  };
}
