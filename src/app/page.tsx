import KindleCal from "./components/kindle-cal/kindle-cal";
import { useRouter } from "next/router";
import { parseBattery } from "./png/battery-params";

export default function Page(params: any) {
  console.log("Page params.searchParams", params.searchParams);
  const battery = parseBattery(params.searchParams);
  console.log(`battery is ${battery}`);
  return (
    <>
      <KindleCal battery={battery} />
    </>
  );
}
