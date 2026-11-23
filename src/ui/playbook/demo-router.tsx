import { UiLocaleContext } from "../../lib/ui-localization";
import { demos } from "./demo-registry";
import { Suspense } from "react";

type PlaybookDemoRouterProps = {
  slug: string;
  dictionary?: Record<string, string>;
};

export function PlaybookDemoRouter({
  slug,
  dictionary,
}: PlaybookDemoRouterProps) {
  const Demo = demos[slug as keyof typeof demos];
  if (!Demo) {
    throw new Error(`Missing playbook demo for slug: ${slug}`);
  }

  return (
    <UiLocaleContext.Provider
      value={{
        chinese: dictionary !== undefined,
        dictionary: dictionary ?? {},
      }}
    >
      <Suspense fallback={null}>
        <Demo />
      </Suspense>
    </UiLocaleContext.Provider>
  );
}

export default PlaybookDemoRouter;
