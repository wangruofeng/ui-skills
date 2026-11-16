import { useUiTree } from "../../lib/ui-localization";
import type { SVGProps } from "react";
import { Button } from "../button";
import { PlaybookDemoCard } from "./demo-card";

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  const localizeUi = useUiTree();

  return localizeUi(
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m10 12-4-4 4-4" />
    </svg>,
  );
}

function GoBackButton({ optical = false }: { optical?: boolean }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <Button variant="primary" shape="round">
      <ChevronLeftIcon {...(optical ? { "data-icon": "inline-start" } : {})} />
      Go back
    </Button>,
  );
}

export default function OpticalAlignmentDemo() {
  return (
    <PlaybookDemoCard
      withoutLabel="Mathematical"
      withLabel="Optical"
      contentClassName="flex w-full justify-center"
      without={<GoBackButton />}
      with={<GoBackButton optical />}
    />
  );
}
