import KindleCal from "./components/kindle-cal/kindle-cal";

export default function Page(params: any) {
  const battery = params.searchParams.battery;
  console.log(`battery is ${battery}`);
  return (
    <>
      <KindleCal battery={battery} />
    </>
  );
}
