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
        selectionMode="multiple"
        defaultSelectedKeys={["0"]}
        aria-label="History Table"
      >
        <TableHeader>
          <TableColumn>UID</TableColumn>
          <TableColumn>LOG</TableColumn>
          <TableColumn>STATUS</TableColumn>
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
                  >
                    {entry.status}
                  </Chip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow key="1">
              <TableCell>No Data</TableCell>
              <TableCell>Check Server status</TableCell>
              <TableCell>Loading</TableCell>
            </TableRow>
          )}
          {/* <TableRow key="1">
            <TableCell>Tony Reichert</TableCell>
            <TableCell>CEO</TableCell>
            <TableCell>Active</TableCell>
          </TableRow> */}
        </TableBody>
      </Table>
    </div>
  );
};
export default EntryLogTable;
