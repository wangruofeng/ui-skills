import { useUiTree } from "../../lib/ui-localization";
import { Button } from "../button";
import { PlaybookDemoCard } from "./demo-card";

function UpgradeCta({ solid = false }: { solid?: boolean }) {
  const localizeUi = useUiTree();

  if (solid) {
    return localizeUi(
      <Button variant="accent" shape="round">
        Upgrade plan
      </Button>,
    );
  }

  return localizeUi(
    <button
      type="button"
      className="bg-content-accent text-content-inverse rounded-full px-5 py-2.5 text-sm font-medium shadow-[0_0_28px_rgba(37,99,235,0.65)]"
    >
      Upgrade plan
    </button>,
  );
}

export default function NoGlowCtaDemo() {
  return (
    <PlaybookDemoCard
      withoutLabel="Glow"
      withLabel="Solid"
      contentClassName="flex w-full justify-center"
      without={<UpgradeCta />}
      with={<UpgradeCta solid />}
    />
  );
}
