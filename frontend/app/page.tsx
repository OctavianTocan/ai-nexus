import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  // TODO: Our chat itself doesn't have a conversation ID. I'm not sure if it's a good idea to make it into a dynamic route? Maybe it is? This needs some research. I've seen it done before that way, though not sure if it's the best way to go.
  // TODO: Naturally, we should have a route for the chat itself, at least. Or, a page of some sort if we're doing SPA.
  return <div>
    <button className="" onClick={() => {
      // Create a new conversation.
      router.push("/c/new");
    }}>New Conversation</button>
  </div>;
}
