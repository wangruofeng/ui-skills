import { useUiTree } from "../../lib/ui-localization";
import { PlaybookDemoCard } from "./demo-card";

function HomeIcon({ strokeWidth = 1.5 }: { strokeWidth?: number }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0 -translate-y-px"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 10.5 9-7 9 7M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"
      />
    </svg>,
  );
}

function NavItem({ matched = false }: { matched?: boolean }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <div className="bg-surface-default ring-line-default flex w-56 items-center gap-2.5 rounded-lg px-4 py-3 ring-1">
      <HomeIcon strokeWidth={matched ? 2 : 1} />
      <span className="text-content-primary text-sm font-semibold">Home</span>
    </div>,
  );
}

export default function IconStrokeWeightDemo() {
  return (
    <PlaybookDemoCard
      withoutLabel="Too light"
      withLabel="Matched"
      contentClassName="flex w-full justify-center"
      without={<NavItem />}
      with={<NavItem matched />}
    />
  );
}
