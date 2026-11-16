import { useUiTree } from "../lib/ui-localization";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";

const popupClass = "bg-surface-default shadow-border";

const itemClass =
  "type-body-md text-content-primary data-highlighted:bg-fill-strong flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 text-left outline-none data-disabled:opacity-60";

function Root({
  modal = false,
  ...props
}: ComponentProps<typeof BaseMenu.Root>) {
  const localizeUi = useUiTree();

  return localizeUi(<BaseMenu.Root modal={modal} {...props} />);
}

function Popup({
  className,
  children,
  side = "bottom",
  align = "end",
  sideOffset = 8,
}: {
  className?: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const localizeUi = useUiTree();

  return localizeUi(
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        className="z-50"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup className={cn(popupClass, className)}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>,
  );
}

function Item({ className, ...props }: ComponentProps<typeof BaseMenu.Item>) {
  const localizeUi = useUiTree();

  return localizeUi(
    <BaseMenu.Item
      className={(state) =>
        cn(
          itemClass,
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />,
  );
}

function LinkItem({
  className,
  ...props
}: ComponentProps<typeof BaseMenu.LinkItem>) {
  const localizeUi = useUiTree();

  return localizeUi(
    <BaseMenu.LinkItem
      className={(state) =>
        cn(
          itemClass,
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />,
  );
}

function CheckboxItem({
  className,
  ...props
}: ComponentProps<typeof BaseMenu.CheckboxItem>) {
  return (
    <BaseMenu.CheckboxItem
      className={(state) =>
        cn(
          itemClass,
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function Separator({
  className,
  ...props
}: ComponentProps<typeof BaseMenu.Separator>) {
  return (
    <BaseMenu.Separator
      className={(state) =>
        cn(
          "border-line-default mx-2 my-1 border-t",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export const Menu = {
  Root,
  Trigger: BaseMenu.Trigger,
  Popup,
  Item,
  LinkItem,
  CheckboxItem,
  CheckboxItemIndicator: BaseMenu.CheckboxItemIndicator,
  Separator,
};
