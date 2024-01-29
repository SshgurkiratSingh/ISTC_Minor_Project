import { Button } from "@nextui-org/react";

import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainNavbar from "../Components/NavigationBar/mainNavbar";
import { Metadata } from "next";
import ChatPage from "./chatPage";

export const metadata: Metadata = {
  title: "Chatbot",
  description: "Website made by students of ISTC for Minor Project",
};
export default function Home() {
  return (
    <div>
      <MainNavbar />
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <ChatPage />
    </div>
  );
}
