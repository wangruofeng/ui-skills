import { useUiTree } from "../../lib/ui-localization";
import { demos } from "./demo-registry";
import { Suspense } from "react";

type PlaybookDemoRouterProps = {
  slug: string;
};

export function PlaybookDemoRouter({ slug }: PlaybookDemoRouterProps) {
  const localizeUi = useUiTree();

  const Demo = demos[slug as keyof typeof demos];
  if (!Demo) {
    throw new Error(`Missing playbook demo for slug: ${slug}`);
  }

  return localizeUi(
    <Suspense fallback={null}>
      <Demo />
    </Suspense>,
  );
}

export default PlaybookDemoRouter;
