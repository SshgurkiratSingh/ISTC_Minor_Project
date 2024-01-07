"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  ModalFooter,
  ModalHeader,
  ModalBody,
  ModalContent,
  TableColumn,
  Tab,
} from "@nextui-org/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  UID?: string;
  userName?: string;
  userType?: string;
  userDescription?: string;
  permissions?: boolean;
  email?: string;
}
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

const ViewUsers = () => {
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
        console.log("API Response:", data);

        // Ensure data.tags is an array
        setUsers(Array.isArray(data?.tags) ? data.tags : []);
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
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onClose={handleClose}
        className="dark"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-black">
            User List
          </ModalHeader>

          <ModalBody>
            <Table id="my-table" className="w-full dark ">
              <TableHeader>
                <TableColumn>UID</TableColumn>
                <TableColumn>User Name</TableColumn>
                <TableColumn>User Type</TableColumn>
                <TableColumn>User Description</TableColumn>
                <TableColumn>Permissions</TableColumn>
                <TableColumn>Email</TableColumn>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.UID}>
                      <TableCell>{user.UID}</TableCell>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell>{user.userType}</TableCell>
                      <TableCell>{user.userDescription}</TableCell>
                      <TableCell>{user.permissions ? "Yes" : "No"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No users found</TableCell>
                    <TableCell>No users found</TableCell>
                    <TableCell>No users found</TableCell>
                    <TableCell>No users found</TableCell>
                    <TableCell>No users found</TableCell>
                    <TableCell>No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ToastContainer />
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
