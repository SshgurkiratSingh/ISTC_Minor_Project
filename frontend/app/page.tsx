import { Button } from "@nextui-org/react";

import MainNavbar from "./Components/NavigationBar/mainNavbar";

import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainBoard from "./Components/MainBoard";
export default function Home() {
  return (
    <div>
      <MainNavbar />
      <MainBoard />
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
    </div>
  );
}
