// components/MessageTable.tsx
"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@nextui-org/react";
import { MqttMessage } from "./services/mqttService";
import StatusChip from "../Components/StatusChip";

interface MessageTableProps {
  messages: MqttMessage[];
  onDeleteMessage: (index: number) => void;
}

const MessageTable: React.FC<MessageTableProps> = ({
  messages,
  onDeleteMessage,
}) => {
  return (
    <div className="max-h-96 overflow-y-auto">
      <Table aria-label="MQTT Messages" removeWrapper>
        <TableHeader>
          <TableColumn>TOPIC</TableColumn>
          <TableColumn>MESSAGE</TableColumn>
          <TableColumn>TIME</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No messages received">
          {messages.map((msg, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-xs">{msg.topic}</TableCell>
              <TableCell className="font-mono text-xs max-w-xs truncate">
                {msg.message.length > 50
                  ? `${msg.message.substring(0, 50)}...`
                  : msg.message}
              </TableCell>
              <TableCell className="text-xs">
                {new Date(msg.timestamp).toUTCString()}
              </TableCell>

              <TableCell>
                <Button color="danger" onClick={() => onDeleteMessage(index)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MessageTable;
