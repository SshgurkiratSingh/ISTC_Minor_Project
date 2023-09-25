import React, { useState } from "react";
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

interface EngageDisengageProps {
  current?: boolean;
  onClick?: () => void;
  className?: string;
  heading?: string;
  subHeading?: string;
  topic?: string;
}

const EngageDisengage = ({
  current,
  onClick,
  className,
  heading,
  topic,
  subHeading,
}: EngageDisengageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const onSubmit = () => {
      
  }

  return (
    <div className="dark">
      <Button color="primary" onClick={() => setIsOpen(true)} variant="shadow">
        {current ? "Disengage Intrusion" : "Engage Intrusion"}
      </Button>
      <Modal backdrop="blur" isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-black">
            {current ? "Disengage Intrusion System" : "Engage Intrusion System"}
          </ModalHeader>
          <ModalBody>
            <button className="btn  text-blue-700 font-bold">
              {current ? "Disengage" : "Engage"}
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

export default EngageDisengage;
