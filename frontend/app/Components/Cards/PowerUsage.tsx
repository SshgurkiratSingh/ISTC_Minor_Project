import { Chip } from "@nextui-org/react";

const PowerConsumptionCard = ({
  powerConsumption,
}: {
  powerConsumption: number;
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <p>Power Consumption:</p>
      <Chip color="warning" variant="bordered">
        {powerConsumption} Watt
      </Chip>
    </div>
  );
};
export default PowerConsumptionCard;
