//Calls guards, which are just rules
//Redirects based on what the guards say.
//A guard can reply with allow, redirect, or errorr objects based on its internal conditions, and be passed information.
//The set of guards to run is passed in to this redirector

//Runs guards in-order, stop at first non-allow result (meaning both redirect AND error).
//If the result is redirect/error perform the correct effect (server redirect vs client router).

//TODO: We need three files:
//redirector.ts - Contains the type definitions for what a Guard is, what it returns, and what it takes in. Contains 'evaluateGuards', which returns allow if all guards return allow. Otherwise returns the response of the guard that doesn't return allow.
//redirector.client.ts
//redirector.server.ts