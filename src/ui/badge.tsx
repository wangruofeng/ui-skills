import { useUiTree } from "../lib/ui-localization";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, children, ...props }: BadgeProps) {
  const localizeUi = useUiTree();

  return localizeUi(
    <span
      className={cn(
        "text-content-primary border-line-default inline-flex h-8 shrink-0 items-center rounded-lg border bg-transparent px-2.5 text-sm font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </span>,
  );
}
