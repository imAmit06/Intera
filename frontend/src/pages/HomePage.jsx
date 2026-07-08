import React from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

const HomePage = () => {
  return (
    <div>
      <Show when="signed-out">
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
};

export default HomePage;
