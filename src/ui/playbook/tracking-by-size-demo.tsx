import { useUiTree } from "../../lib/ui-localization";
import { PlaybookDemoCard } from "./demo-card";

function DisplayHeading({ tuned = false }: { tuned?: boolean }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <h2
      className={`text-content-primary text-3xl leading-tight font-medium ${
        tuned ? "tracking-tight" : "tracking-wide"
      }`}
    >
      Better interfaces
    </h2>,
  );
}

export default function TrackingBySizeDemo() {
  return (
    <PlaybookDemoCard
      withoutLabel="Too wide"
      withLabel="Tuned"
      contentClassName="flex w-full justify-center"
      without={<DisplayHeading />}
      with={<DisplayHeading tuned />}
    />
  );
}
