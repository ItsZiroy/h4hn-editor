import { memo } from "react";

type SpanProps = React.ComponentPropsWithoutRef<"span">;

export const SumIcon = memo(({ className, ...props }: SpanProps) => {
  return (
    <span className={className} {...props}>
      ∑
    </span>
  );
});

SumIcon.displayName = "SumIcon";
