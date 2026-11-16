import { useUiTree } from "../../lib/ui-localization";
import { PlaybookDemoCard } from "./demo-card";

const FILENAME = "quarterly-brand-guidelines-final-v3.pdf";

function FileRow({ softFade = false }: { softFade?: boolean }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <div className="bg-surface-default ring-line-default w-48 rounded-lg p-3 ring-1">
      <p className="text-content-secondary text-xs">Attachment</p>
      <p
        className={
          softFade
            ? "text-content-primary mt-1 overflow-hidden [mask-image:linear-gradient(to_right,black_80%,transparent)] text-sm whitespace-nowrap"
            : "text-content-primary mt-1 truncate text-sm"
        }
      >
        {FILENAME}
      </p>
    </div>,
  );
}

export default function SoftTruncateDemo() {
  return (
    <PlaybookDemoCard
      withoutLabel="Ellipsis"
      withLabel="Soft fade"
      contentClassName="flex w-full justify-center"
      without={<FileRow />}
      with={<FileRow softFade />}
    />
  );
}
