# AI Nexus User Guide

Welcome to AI Nexus, your personal "second brain" chatbot powered by advanced AI.

## Getting Started

### Creating an Account

1. Navigate to the application (default: `http://localhost:3001`)
2. Click **Sign Up** or navigate to `/signup`
3. Fill in your details:
    - **Full Name** - Your display name
    - **Email** - Your email address
    - **Password** - Must be at least 8 characters
    - **Confirm Password** - Re-enter your password
4. Click **Create Account**
5. You'll be redirected to the login page

### Logging In

1. Navigate to `/login`
2. Enter your email and password
3. Click **Sign In**
4. You'll be redirected to the home page

### Logging Out

Currently, you can log out by clearing your browser cookies or waiting for the session to expire (1 hour).

---

## Using the Chat

### Starting a New Conversation

1. From the home page, click the **New Conversation** button
2. You'll be taken to a new chat page with a unique URL
3. Type your message in the input field at the bottom
4. Press **Enter** or click the send button

### Sending Messages

1. Type your message in the text area
2. Press **Enter** to send (or click the send button)
3. Wait for the AI to respond
4. The response will stream in real-time, word by word

### Understanding the Interface

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Nexus Chat                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  User: What is the weather like today?              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AI: I don't have access to real-time weather       │   │
│  │  data. To get accurate weather information...       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Message input field...]                      [➤]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Message Types

- **User Messages** - Your messages appear on the right
- **AI Responses** - AI responses appear on the left
- **Thinking Indicator** - Shows "Thinking..." while waiting for response

---

## Tips for Better Conversations

### Be Specific

Instead of:

> "Tell me about programming"

Try:

> "Explain the difference between Python lists and tuples with examples"

### Provide Context

Instead of:

> "Fix this"

Try:

> "I have a JavaScript function that should filter an array but it's returning undefined. Here's the code: [your code]. What's wrong?"

### Ask Follow-up Questions

The AI remembers your conversation context, so you can ask follow-up questions:

1. "What is React?"
2. "How does it compare to Vue?"
3. "Which one should I use for a small project?"

### Use the AI for Various Tasks

- **Coding Help** - Debugging, code review, learning new languages
- **Writing** - Drafting emails, blog posts, documentation
- **Learning** - Explaining concepts, answering questions
- **Brainstorming** - Generating ideas, exploring options
- **Analysis** - Breaking down problems, comparing solutions

---

## Troubleshooting

### Issue: Chat doesn't respond

**Possible causes:**

- Session expired (1 hour timeout)
- Network connection issue
- Backend service is down

**Solutions:**

1. Refresh the page
2. Log out and log back in
3. Check that both frontend and backend services are running

### Issue: Messages disappear on refresh

**Current behavior:** Chat history is stored in browser memory only and is lost on page refresh.

**Workaround:** Keep the browser tab open during your session.

**Note:** This is a known limitation that will be addressed in a future update.

### Issue: Login fails silently

**Possible causes:**

- Incorrect email or password
- User account doesn't exist

**Solutions:**

1. Double-check your email and password
2. If you haven't registered, create an account first
3. Note: Error messages are being improved in an upcoming update

### Issue: Registration doesn't show confirmation

**Current behavior:** The registration form may not show clear success/failure feedback.

**What to do:**

1. After clicking "Create Account", wait a few seconds
2. Try logging in with your credentials
3. If login fails, try registering again

---

## Keyboard Shortcuts

| Shortcut        | Action              |
| --------------- | ------------------- |
| `Enter`         | Send message        |
| `Shift + Enter` | New line in message |

---

## Browser Compatibility

AI Nexus works best on modern browsers:

| Browser     | Support |
| ----------- | ------- |
| Chrome 90+  | Full    |
| Firefox 88+ | Full    |
| Safari 14+  | Full    |
| Edge 90+    | Full    |

**Note:** SSE (Server-Sent Events) requires a browser that supports the Fetch API with streaming.

---

## Privacy & Data

### What data is stored?

- **Account Information** - Email and hashed password
- **Conversations** - Conversation titles and timestamps
- **Messages** - Your messages and AI responses (stored by the Agno framework)

### Where is data stored?

All data is stored locally in the `agno.db` SQLite database on the server running the application.

### Session Duration

Your login session lasts for 1 hour. After that, you'll need to log in again.

---

## Getting Help

If you encounter issues:

1. Check this User Guide for solutions
2. Review the [Troubleshooting](#troubleshooting) section
3. Check if the issue is listed in the project's TODO.md
4. Report issues to the project maintainers

---

## Coming Soon

Features planned for future releases:

- **Conversation Sidebar** - Browse and manage your past conversations
- **Message History** - Persist messages across page refreshes
- **Rename Conversations** - Give your chats meaningful titles
- **Delete Conversations** - Remove unwanted conversations
- **Improved Error Handling** - Better feedback for login/signup errors
- **Auto-generated Titles** - AI-generated conversation titles based on content
- **Dark Mode Toggle** - Switch between light and dark themes
- **Mobile Responsive Design** - Better experience on phones and tablets
