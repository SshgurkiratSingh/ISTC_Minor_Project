import { FcCancel } from "react-icons/fc";
import { TiTickOutline } from "react-icons/ti";
import { Chip } from "@nextui-org/react";

interface StatusChipProps {
  status: boolean;
  label: string;
  trueText?: string;
  falseText?: string;
}
const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  trueText = "Open",
  falseText = "Closed",
}) => (
  <Chip
    startContent={status ? <TiTickOutline size={20} /> : <FcCancel size={20} />}
    variant="faded"
    color={status ? "success" : "danger"}
  >
    <p className="font-bold">{`${label} ${status ? falseText : trueText}`}</p>
  </Chip>
);
export default StatusChip;
