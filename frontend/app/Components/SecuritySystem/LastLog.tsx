import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  Chip,
  TableRow,
  TableCell,
} from "@nextui-org/react";
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
                  {new Date(entry.timestamp || "").toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    color={entry.status === "approved" ? "success" : "danger"}
                    className="font-bold"
                  >
                    {entry.status}
                  </Chip>
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
