import "./App.css";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/react";

function App() {
  return (
    <>
      <h1>Welcome to Intera</h1>
      <Show when="signed-out">
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </Show>
      <Show when="signed-in">
        <UserButton mode="modal" />
      </Show>
    </>
  );
}

export default App;
