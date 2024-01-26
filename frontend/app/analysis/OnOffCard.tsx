import React from "react";
import {
  CircularProgress,
  Card,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";
interface OnOffCardProps {
  Heading: string;
  Value: number;
}
const OnOffCard: React.FC<OnOffCardProps> = ({ Heading, Value }) => {
  return (
    <Card className="w-[240px] h-[240px] border-none bg-gradient-to-br from-blue-500   to-slate-600">
      <CardBody className="justify-center items-center pb-0">
        <CircularProgress
          classNames={{
            svg: "w-36 h-36 drop-shadow-md",
            indicator: "stroke-white",
            track: "stroke-white/10",
            value: "text-3xl font-semibold text-white",
          }}
          value={Number(Value)}
          strokeWidth={4}
          showValueLabel={true}
        />
      </CardBody>
      <CardFooter className="justify-center items-center pt-0">
        <Chip
          classNames={{
            base: "border-1 border-white/30",
            content: "text-white/90 text-small font-semibold",
          }}
          variant="bordered"
        >
          {Heading}
        </Chip>
      </CardFooter>
    </Card>
  );
};
export default OnOffCard;
