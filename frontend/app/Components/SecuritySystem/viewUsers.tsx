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

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface User {
  UID: string;
  userName: string;
  userType: string;
  userDescription: string;
  permissions: boolean;
  email: string;
}
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
const ViewUsers = () => {
  const [close, setClose] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const openModal = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    fetch("/api/security/getAllUser")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data); // Log the entire response for detailed inspection
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Error fetching user data");
      });
  }, []);

  return (
    <div className="dark">
      <Button
        color="success"
        onClick={() => setIsOpen(true)}
        variant="shadow"
        className="hover:scale-105 transition text-black"
      >
        View Users
      </Button>
      <Modal backdrop="blur" isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-black">
            User List {users.toString()}
          </ModalHeader>
          <ModalBody>
            {/* <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>UID</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>User Type</TableCell>
                  <TableCell>User Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => {
                    console.log("Current User:", user); // Add this line for debugging
                    return (
                      <TableRow key={user.UID}>
                        <TableCell>{user.UID}</TableCell>
                        <TableCell>{user.userName}</TableCell>
                        <TableCell>{user.userType}</TableCell>
                        <TableCell>{user.userDescription}</TableCell>
                        <TableCell>{user.permissions ? "Yes" : "No"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>No users available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table> */}
            <ToastContainer />{" "}
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
export default ViewUsers;
