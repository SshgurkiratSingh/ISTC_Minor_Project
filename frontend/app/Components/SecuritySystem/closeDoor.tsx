import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Select, SelectItem, Switch } from "@nextui-org/react";
import API_BASE_URL from "@/APIconfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CloseOpenDoorProps {
  current: boolean;
  onClick: () => void;
  className?: string;
  heading?: string;
  subHeading?: string;
  topic?: string;
  location?: string;
}
const CloseOpenDoor = ({
  current,
  onClick,
  className,
  heading,
  topic,
  subHeading,
  location,
}: CloseOpenDoorProps) => {
  const [close, setClose] = useState(false);
  useEffect(() => {
    setClose(current);
  }, [current, setClose]);
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const makeGetRequest = () => {
    const invertedValue = current; // Invert the current value
    const encodedTopic = encodeURIComponent(topic || ""); // Encode the topic (if provided)

    // Construct the URL
    const url = `${API_BASE_URL}/api/frontend/publish?value=${
      invertedValue ? "0" : "1"
    }&topic=${encodedTopic}`;

    // Make the GET request
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data as needed
        console.log("GET request successful:", data);
        toast.success(`Switch toggled: ${data.message}`);
      })

      .catch((error) => {
        toast.error("HTTP GET request failed");
        console.error("Error making GET request:", error);
      });
    handleClose();
    onClick();
  };

  return (
    <div className="dark">
      <Button
        color={current ? "warning" : "danger"}
        onClick={() => setIsOpen(true)}
        variant="shadow"
      >
        {current
          ? `Open ${location ? location : "door"}`
          : `Close ${location ? location : "door"}`}
      </Button>
      <Modal backdrop="blur" isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-black">
            {current ? "Disengage Intrusion System" : "Engage Intrusion System"}
          </ModalHeader>
          <ModalBody>
            <button
              className="btn  text-blue-700 font-bold"
              onClick={makeGetRequest}
            >
              {current ? "Open" : "close"}
            </button>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
export default CloseOpenDoor;
