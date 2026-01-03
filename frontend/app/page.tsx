import Chat from "@/components/chat/chat";
// import { useAuthedFetch } from "@/lib/use-authed-fetch";
// import { useEffect } from "react";

export default function Page() {
  // Fetch the current user.
  // TODO: authedFetch's identity changes every time → the effect would re-run every render → gross. Needs fixing.
  // const authedFetch = useAuthedFetch();
  // useEffect(() => {
  //   authedFetch();
  // }, [authedFetch]);

  // Needs to be a server-rendered component, so we can run our custom redirector on the server, and avoid flashing when logging in.
  //TODO: https://chatgpt.com/s/t_6958d43753248191ae4b4d899275f7c7

  return <Chat />;
}
