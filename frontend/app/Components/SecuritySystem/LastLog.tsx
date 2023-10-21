import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
} from "@nextui-org/react";
import StatusChip from "../StatusChip";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDistanceToNow } from "date-fns";

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
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState<EntryLogItem[]>([]);

  useEffect(() => {
    if (filter === "") {
      setFilteredData(data);
      return;
    }

    const lowerCaseFilter = filter.toLowerCase();
    const filtered = data.filter(
      (entry) =>
        entry.userName?.toLowerCase().includes(lowerCaseFilter) ||
        entry.UID.toLowerCase().includes(lowerCaseFilter) ||
        entry.status.toLowerCase().includes(lowerCaseFilter)
    );
    setFilteredData(filtered);
  }, [data, filter]);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, { html: "#my-table" });
    doc.save("data.pdf");
  };

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(offset, offset + itemsPerPage);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 w-full">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by UID, username or status..."
          size="md"
        />

        <Button
          onClick={exportToPDF}
          variant="bordered"
          size="lg"
          style={{ width: "150px" }}
        >
          Export to PDF
        </Button>
      </div>

      <Table color={"secondary"} aria-label="History Table" id="my-table">
        <TableHeader>
          <TableColumn>UID</TableColumn>
          <TableColumn>LOG</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>Time</TableColumn>
        </TableHeader>
        <TableBody>
          {currentItems.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{entry.UID}</TableCell>
              <TableCell>
                {entry.nodeLocation} {entry.description} of {entry.userName}
              </TableCell>
              <TableCell>
                <StatusChip
                  status={entry.status === "approved"}
                  label={entry.status}
                  trueText=""
                  falseText=""
                />
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(entry.timestamp))} ago
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ReactPaginate
        previousLabel={
          <span className="px-4 py-2 bg-blue-500 text-white rounded-lg transition duration-300 hover:bg-blue-400">
            Previous Page
          </span>
        }
        nextLabel={
          <span className="px-4 py-2 bg-blue-500 text-white rounded-lg transition duration-300 hover:bg-blue-400">
            Next Page
          </span>
        }
        breakLabel={<span className="px-2 py-1">...</span>}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination flex justify-center p-2 m space-x-2"}
        pageClassName={
          "px-2 py-1 bg-gray-700 rounded-lg transition duration-300 hover:bg-gray-600 cursor-pointer"
        }
        activeClassName={"bg-blue-500 text-green-500"}
        breakClassName="break-me px-2 py-1"
        initialPage={0}
        disableInitialCallback={true}
      />
    </div>
  );
};

export default EntryLogTable;
