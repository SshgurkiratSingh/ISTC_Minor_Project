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

const AddUserModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [UID, setUID] = useState("");
  const [userName, setUserName] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [permissions, setPermissions] = useState(false);
  const [userType, setUserType] = useState("guest");
  const [serverPassword, setServerPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverData, setServerData] = useState(null);
  const [error, setError] = useState(null); // State to hold server error

  const onSubmit = () => {
    if (!email || !UID || !userName || !userDescription) {
      setIsError(true);
      return;
    }

    setIsError(false);
    setIsSubmitting(true);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        UID,
        userName,
        userDescription,
        permissions,
        userType,
        serverPassword,
      }),
    };

    fetch(`/api/security/addUser`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setServerData(data);
        setIsOpen(false);
        setIsSubmitting(false);
        // Display a success toast
        toast.success("User added successfully", { autoClose: 3000 });
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error);
        setIsSubmitting(false);
        // Display an error toast
        toast.error("Error adding user. Please try again.", {
          autoClose: 3000,
        });
      });
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null); // Clear any previous errors when closing the modal
  };

  const per = [
    { label: "Guest", value: "guest" },
    { label: "User", value: "user" },
    { label: "Admin", value: "admin" },
  ];

  return (
    <div className="dark">
      <Button
        color="primary"
        onClick={() => setIsOpen(true)}
        variant="shadow"
        className="hover:scale-105 transition text-black"
      >
        Add User
      </Button>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onClose={handleClose}
        className="dark"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Add User</ModalHeader>
          <ModalBody>
            <Input
              disabled={isSubmitting}
              type="name"
              label="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <Input
              disabled={isSubmitting}
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              disabled={isSubmitting}
              label="UID"
              value={UID}
              onChange={(e) => setUID(e.target.value)}
              required
            />
            <Input
              disabled={isSubmitting}
              label="Description"
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              required
            />
            <Select
              disabled={isSubmitting}
              radius="lg"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              label="Select User Type"
              placeholder="Select User Type"
              className="bg-black/20"
            >
              {per.map((perm) => (
                <SelectItem
                  key={perm.value}
                  value={perm.value}
                  className="bg-black/20"
                >
                  {perm.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              disabled={isSubmitting}
              type="password"
              label="Server Password"
              value={serverPassword}
              onChange={(e) => setServerPassword(e.target.value)}
            />
            <Switch
              isDisabled={isSubmitting}
              isSelected={permissions}
              onChange={() => setPermissions(!permissions)}
            >
              Permission
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={handleClose}>
              Close
            </Button>
            <Button color="primary" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Action"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AddUserModal;
