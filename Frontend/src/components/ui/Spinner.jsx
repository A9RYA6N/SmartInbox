import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

export const Spinner = ({ size = 24, className }) => (
  <Loader2 size={size} className={clsx("animate-spin", className)} />
);
