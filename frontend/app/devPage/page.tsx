import { Button } from "@nextui-org/react";

import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainNavbar from "../Components/NavigationBar/mainNavbar";
import SecuritySystemPage from "../Components/SecuritySystem/mainPage";
import MainScheduler from "./component/MainScheduler";

export default function Home() {
  return (
    <div>
      <MainNavbar />
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <MainScheduler />
    </div>
  );
}
