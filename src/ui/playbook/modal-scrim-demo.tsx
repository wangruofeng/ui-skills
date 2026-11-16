import { useUiTree } from "../../lib/ui-localization";
import { useState } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import { PlaybookSwitchRow } from "./demo-card";

function SettingsPanel({ onOpen }: { onOpen: () => void }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <div className="flex h-full flex-col items-center justify-center p-6">
      <p className="text-content-secondary text-center text-sm">
        Workspace settings
      </p>
      <Button
        type="button"
        shape="round"
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={onOpen}
      >
        Delete workspace
      </Button>
    </div>,
  );
}

export default function ModalScrimDemo() {
  const localizeUi = useUiTree();

  const [showTip, setShowTip] = useState(false);
  const [open, setOpen] = useState(false);

  return localizeUi(
    <div className="border-line-default bg-surface-default sm:ring-line-default relative h-84 w-full max-w-3xl overflow-hidden rounded-none border-t border-b shadow-2xs sm:h-88 sm:rounded-[8px] sm:border-none sm:shadow-2xs sm:ring-1">
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 sm:top-5 sm:right-5">
        <PlaybookSwitchRow
          offLabel="Blur scrim"
          onLabel="Solid scrim"
          checked={showTip}
          onCheckedChange={setShowTip}
          aria-label="Blur scrim or Solid scrim"
        />
      </div>

      <div className="relative h-full">
        <SettingsPanel onOpen={() => setOpen(true)} />
      </div>

      {open ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
          <div
            className={cn(
              "absolute inset-0",
              showTip
                ? "bg-fill-inverse/20"
                : "bg-fill-inverse/10 backdrop-blur-sm",
            )}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="bg-surface-default ring-line-default relative w-full max-w-xs rounded-xl p-4 shadow-lg ring-1">
            <p className="text-content-primary text-sm font-medium">
              Delete workspace?
            </p>
            <p className="text-content-secondary mt-1 text-sm">
              This cannot be undone.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                shape="round"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                shape="round"
                size="sm"
                className="text-content-inverse bg-red-600 hover:bg-red-700"
                onClick={() => setOpen(false)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
  );
}
