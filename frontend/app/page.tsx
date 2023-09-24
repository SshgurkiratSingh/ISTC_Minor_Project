import { Button } from "@nextui-org/react";
import NavBar from "./Components/NavigationBar/navBar";
import MainNavbar from "./Components/NavigationBar/mainNavbar";
import Dashboard from "./Components/Dashboard";
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
