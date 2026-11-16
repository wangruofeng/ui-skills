import { useUiTree } from "../lib/ui-localization";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  closeOnClick?: boolean;
};

export function TooltipProvider({ children }: { children: ReactNode }) {
  const localizeUi = useUiTree();

  return localizeUi(
    <TooltipPrimitive.Provider delay={0} closeDelay={0}>
      {children}
    </TooltipPrimitive.Provider>,
  );
}

export function Tooltip({
  content,
  children,
  side = "bottom",
  closeOnClick = true,
}: TooltipProps) {
  const localizeUi = useUiTree();

  return localizeUi(
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger
        delay={0}
        closeOnClick={closeOnClick}
        render={children}
      />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          className="z-50"
          side={side}
          sideOffset={6}
        >
          <TooltipPrimitive.Popup className="type-body-sm bg-fill-inverse text-content-inverse rounded-md border-0 px-2 py-1 font-normal shadow-none">
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>,
  );
}
