"use client";
import Chat from "@/components/chat/chat";
import { useAuthedFetch } from "@/lib/use-authed-fetch"
import { useEffect } from "react";

export default function Page() {

  // Fetch the current user.
  // TODO: authedFetch's identity changes every time → the effect would re-run every render → gross. Needs fixing.
  const authedFetch = useAuthedFetch();
  useEffect(() => {
    authedFetch();
  }, [authedFetch]);

  return <Chat />;
}