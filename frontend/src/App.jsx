import "./App.css";
import { SignInButton, SignUpButton } from "@clerk/react";

function App() {
  return (
    <>
      <h1>Welcome to Intera</h1>
      <SignInButton mode="modal" />
      <SignUpButton mode="modal" />
    </>
  );
}

export default App;
