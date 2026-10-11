"use client";

import { AnimatePresence, m, useScroll, useSpring } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SpiritMark } from "@/components/brand/spirit-flame";
import { socialIcons } from "@/components/brand/social-icons";
import { Container, MonoTag } from "@/components/ui/primitives";
import { navLinks, site, socials } from "@/lib/site";
import { cn, pad } from "@/lib/utils";

const sectionIds = navLinks.map((l) => l.href.slice(1));

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page is scrolled past the top, including a scroll position restored on reload. */
const useScrolled = () =>
  useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 12,
    () => false,
  );

/** Tracks which page section currently crosses the middle of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        setActive(ids.find((id) => visible.get(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-white/10 bg-ink/75 backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-gradient-to-b from-ink/80 to-transparent",
        )}
      >
        <a
          href="#main"
          className="sr-only z-[60] bg-volt px-4 py-2 font-mono text-xs tracking-widest text-ink uppercase focus:not-sr-only focus:absolute focus:top-3 focus:left-4"
        >
          Skip to content
        </a>

        <Container
          className={cn(
            "flex items-center justify-between gap-6 transition-[height] duration-500",
            scrolled ? "h-16" : "h-20",
          )}
        >
          <a
            href="#top"
            className="group flex shrink-0 items-center gap-3"
            aria-label="SPIRIT, FTC team 25547, back to top"
          >
            <SpiritMark id="nav-mark" className="group-hover:drop-shadow-[0_0_16px_rgba(255,230,0,0.75)]" />
            <span className="flex items-baseline gap-2">
              <span className="font-display text-[1.65rem] leading-none font-black tracking-[0.06em] text-white uppercase">
                Spirit
              </span>
              <span className="font-mono text-xs font-semibold tracking-[0.12em] text-volt">[{site.teamNumber}]</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = active === link.href.slice(1);
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "group relative block px-3 py-2 font-display text-[15px] font-semibold tracking-[0.12em] uppercase transition-colors duration-200",
                        isActive ? "text-white" : "text-white/60 hover:text-white",
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-white/40 transition-transform duration-300 group-hover:scale-x-100"
                      />
                      {isActive && (
                        <m.span
                          layoutId="nav-active"
                          aria-hidden="true"
                          className="absolute inset-x-3 bottom-0 h-0.5 bg-volt shadow-glow"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#sponsors"
              className="group hidden items-center gap-2 bg-volt px-5 py-2.5 font-display text-sm font-extrabold tracking-[0.16em] text-ink uppercase transition-colors duration-200 hover:bg-[#fff04d] hover:motion-safe:animate-pulse-ring hover:motion-reduce:shadow-glow sm:inline-flex"
            >
              <Zap
                className="size-4 fill-ink transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12"
                aria-hidden="true"
              />
              Sponsor us
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center border border-white/15 text-white transition-colors hover:border-volt hover:text-volt xl:hidden"
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </Container>

        {/* Scroll progress */}
        <m.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-blaze via-volt to-white shadow-glow"
          style={{ scaleX: progress }}
        />
      </header>

      {/* Rendered outside the header: its backdrop-filter would otherwise trap `position: fixed`. */}
      <AnimatePresence>{open && <MobileDrawer active={active} onClose={close} />}</AnimatePresence>
    </>
  );
}

function MobileDrawer({ active, onClose }: { active: string | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      // Keep focus inside the drawer.
      const focusables = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const onResize = () => window.innerWidth >= 1280 && onClose();
    window.addEventListener("resize", onResize);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  return (
    <>
      <m.div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm xl:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <m.div
        ref={panelRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="fixed inset-y-0 right-0 z-[61] flex h-[100dvh] w-[min(88vw,380px)] flex-col border-l border-volt/30 bg-ink/95 backdrop-blur-xl xl:hidden"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <MonoTag>NAV {"//"} SYS.25547</MonoTag>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-11 place-items-center border border-white/15 text-white transition-colors hover:border-volt hover:text-volt"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {navLinks.map((link, i) => {
              const isActive = active === link.href.slice(1);
              return (
                <m.li
                  key={link.href}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={link.href}
                    onClick={onClose}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "group flex items-baseline gap-4 border-b border-white/5 py-3.5 font-display text-[1.7rem] font-bold tracking-wide uppercase transition-colors",
                      isActive ? "text-volt" : "text-white hover:text-volt",
                    )}
                  >
                    <span className="font-mono text-xs text-mute group-hover:text-volt">{pad(i + 1)}</span>
                    {link.label}
                  </a>
                </m.li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-5 border-t border-white/10 p-5">
          <a
            href="#sponsors"
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-volt py-3.5 font-display text-base font-extrabold tracking-[0.16em] text-ink uppercase shadow-glow"
          >
            <Zap className="size-4 fill-ink" aria-hidden="true" />
            Sponsor us
          </a>
          <ul className="flex items-center justify-center gap-2">
            {socials.slice(0, 5).map((s) => {
              const Icon = socialIcons[s.id];
              return (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-11 place-items-center border border-white/10 text-mute transition-colors hover:border-volt hover:text-volt"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </m.div>
    </>
  );
}
