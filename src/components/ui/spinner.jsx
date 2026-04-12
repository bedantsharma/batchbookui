import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }) {
  return (
    <div
      className={cn("w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin", className)}
      {...props}
    />
  );
}
