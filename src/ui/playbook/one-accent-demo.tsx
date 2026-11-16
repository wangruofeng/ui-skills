import { useUiTree } from "../../lib/ui-localization";
import { Button } from "../button";
import { PlaybookDemoCard } from "./demo-card";

const compactButtonClass = "rounded-lg px-3.5 py-1.5 text-xs font-medium";

function ActionRow({ singleAccent = false }: { singleAccent?: boolean }) {
  const localizeUi = useUiTree();

  if (singleAccent) {
    return localizeUi(
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="accent" size="sm">
          Save
        </Button>
        <Button variant="outline" size="sm">
          Publish
        </Button>
        <Button variant="ghost" size="sm">
          Share
        </Button>
      </div>,
    );
  }

  return localizeUi(
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={`${compactButtonClass} bg-content-accent text-content-inverse`}
      >
        Save
      </button>
      <button
        type="button"
        className={`${compactButtonClass} text-content-inverse bg-emerald-600`}
      >
        Publish
      </button>
      <button
        type="button"
        className={`${compactButtonClass} text-content-inverse bg-orange-500`}
      >
        Share
      </button>
    </div>,
  );
}

export default function OneAccentDemo() {
  return (
    <PlaybookDemoCard
      withoutLabel="Rainbow"
      withLabel="One accent"
      contentClassName="flex w-full justify-center"
      without={<ActionRow />}
      with={<ActionRow singleAccent />}
    />
  );
}
