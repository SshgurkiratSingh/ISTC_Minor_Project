// components/ConnectionLogs.tsx
"use client";
import React from "react";
import { Button } from "@nextui-org/react";

interface ConnectionLogsProps {
  logs: string[];
  onDeleteLog: (index: number) => void;
}

const ConnectionLogs: React.FC<ConnectionLogsProps> = ({
  logs,
  onDeleteLog,
}) => {
  return (
    <div className="max-h-40 overflow-y-auto p-2 bg-gray-900 rounded">
      <h4 className="font-bold mb-2">Connection Logs</h4>
      {logs.map((log, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center text-xs font-mono mb-1"
        >
          <span>{log}</span>
          <Button color="danger" onClick={() => onDeleteLog(idx)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ConnectionLogs;
