import { Button } from "@nextui-org/react";

import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainNavbar from "../Components/NavigationBar/mainNavbar";
import { Metadata } from "next";
import ParkingContent from "./parkingContent";

export const metadata: Metadata = {
  title: "DHT11 Monitor",
  description: "MQTT Monitor for DHT11 Sensor",
  keywords: "DHT11, MQTT, Sensor Monitor",
};
export default function Home() {
  return (
    <div>
      <MainNavbar />
      <ToastContainer theme="dark" closeOnClick transition={Bounce} />
      <ParkingContent />
    </div>
  );
}
