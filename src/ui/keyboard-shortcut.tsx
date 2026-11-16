import { useUiTree } from "../lib/ui-localization";
import { useEffect, useState } from "react";
import { CommandLineIcon } from "@heroicons/react/24/outline";

const shortcutClass =
  "inline-flex h-[18px] select-none items-center gap-0.5 bg-transparent font-mono text-[10px] text-content-inverse/60";

function CommandIcon() {
  const localizeUi = useUiTree();

  return localizeUi(
    <CommandLineIcon className="size-2.5" aria-hidden="true" />,
  );
}

export function CommandKShortcut() {
  const localizeUi = useUiTree();

  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return localizeUi(
    <kbd className={shortcutClass}>
      {isMac ? (
        <>
          <CommandIcon />K
        </>
      ) : (
        <>Ctrl K</>
      )}
    </kbd>,
  );
}
