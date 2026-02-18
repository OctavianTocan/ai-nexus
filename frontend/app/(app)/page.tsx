import NewConversationButton from "@/components/buttons/NewConversationButton";

/**
 * Page is the landing page of the application.
 * It displays a button to create a new conversation.
 * When the button is clicked, it creates a new conversation and navigates to the new conversation route.
 *
 * @returns The landing page of the application.
 */
export default function Page() {
  // Render the page.
  return (
    <div className="flex justify-center h-screen items-center">
      <NewConversationButton />
    </div>
  )
}
