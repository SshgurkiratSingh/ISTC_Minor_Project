import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import StatusChip from "../StatusChip";
export interface EntryLogItem {
  nodeLocation: string;
  UID: string;
  timestamp: string;
  description: string;
  status: "unknown" | "approved";
  userName?: string;
}

interface SecuritySystemProps {
  data: EntryLogItem[];
}
const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
const EntryLogTable = ({ data }: SecuritySystemProps) => {
  return (
    <div>
      <Table
        color={"secondary"}
        // selectionMode="multiple"
        // defaultSelectedKeys={["0"]}
        aria-label="History Table"
      >
        <TableHeader>
          <TableColumn>UID</TableColumn>
          <TableColumn>LOG</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>Location</TableColumn>
        </TableHeader>
        <TableBody>
          {data ? (
            data.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.UID}</TableCell>
                <TableCell>
                  {entry.description} of {entry.userName} at{" "}
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={entry.status === "approved"}
                    label={entry.status}
                    trueText=""
                    falseText=""
                  />
                </TableCell>
                <TableCell>{entry.nodeLocation}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow key="1">
              <TableCell>No Data</TableCell>
              <TableCell>Check Server status</TableCell>
              <TableCell>Loading</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default EntryLogTable;
