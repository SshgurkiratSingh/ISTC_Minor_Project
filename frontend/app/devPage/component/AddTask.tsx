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
import { IoMdAddCircle, IoMdAddCircleOutline } from "react-icons/io";

const AddTask = () => {
  const [close, setClose] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="dark">
      <Button isIconOnly color="success" variant="faded" onClick={openModal}>
        <IoMdAddCircleOutline size={35} />
      </Button>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onClose={handleClose}
        className="dark"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Kindly furnish the necessary details.
          </ModalHeader>
          <ModalBody></ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
export default AddTask;
