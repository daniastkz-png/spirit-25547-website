import { cn } from "@/lib/utils";

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
};

/**
 * Chamfered call-to-action link.
 * The glow lives on the outer anchor (a drop-shadow filter) so the clip-path on the
 * inner face can't crop it.
 */
export function ButtonLink({ variant = "primary", size = "lg", className, children, ...props }: ButtonLinkProps) {
  const face = cn(
    "relative inline-flex w-full items-center justify-center gap-3 overflow-hidden font-display font-bold tracking-[0.14em] uppercase transition-colors duration-300 [--chamfer:11px] clip-chamfer",
    size === "lg" ? "px-7 py-4 text-[15px]" : "px-5 py-3 text-sm",
  );

  return (
    <a
      className={cn(
        "group relative inline-flex transition-[filter,transform] duration-300 ease-snap select-none active:scale-[0.98]",
        variant === "primary"
          ? "hover:drop-shadow-[0_0_20px_rgba(255,230,0,0.55)]"
          : "hover:drop-shadow-[0_0_16px_rgba(255,230,0,0.35)]",
        className,
      )}
      {...props}
    >
      {variant === "primary" ? (
        <span className={cn(face, "bg-volt text-ink group-hover:bg-[#fff04d]")}>
          {children}
          {/* Light sweep */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] skew-x-[-20deg] bg-white/50 transition-transform duration-700 ease-snap group-hover:translate-x-[400%]"
          />
        </span>
      ) : (
        <span className="inline-flex w-full bg-volt/70 p-px transition-colors duration-300 [--chamfer:11px] clip-chamfer group-hover:bg-volt">
          <span className={cn(face, "bg-ink/90 text-white group-hover:bg-[#17150a]")}>{children}</span>
        </span>
      )}
    </a>
  );
}
