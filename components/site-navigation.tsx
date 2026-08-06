"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const navigation = [
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/makaleler", label: "Makaleler" },
  { href: "/sik-sorulan-sorular", label: "Sık Sorulanlar" },
  { href: "/iletisim", label: "İletişim" },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Ana navigasyon"
      className="hidden items-center gap-1 lg:flex"
    >
      {navigation.map((item) => (
        <Link
          aria-current={isCurrentPath(pathname, item.href) ? "page" : undefined}
          className="nav-link aria-[current=page]:bg-surface-muted aria-[current=page]:text-primary"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
      <Link
        className="bg-primary hover:bg-primary-strong ml-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
        href="/iletisim#randevu-formu"
      >
        Randevu talebi
      </Link>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => detailsRef.current?.removeAttribute("open");
  return (
    <details className="mobile-menu relative lg:hidden" ref={detailsRef}>
      <summary className="border-border inline-flex min-h-11 cursor-pointer list-none items-center rounded-xl border bg-white px-4 text-sm font-bold marker:hidden">
        Menü
      </summary>
      <nav
        aria-label="Mobil navigasyon"
        className="border-border shadow-dialog absolute top-[calc(100%+0.75rem)] right-0 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border bg-white p-3"
      >
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                aria-current={
                  isCurrentPath(pathname, item.href) ? "page" : undefined
                }
                className="hover:bg-surface-muted aria-[current=page]:bg-surface-muted aria-[current=page]:text-primary block min-h-11 rounded-lg px-3 py-2.5 font-semibold"
                href={item.href}
                onClick={close}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              className="bg-primary block min-h-11 rounded-lg px-3 py-2.5 text-center font-bold text-white"
              href="/iletisim#randevu-formu"
              onClick={close}
            >
              Randevu talebi
            </Link>
          </li>
        </ul>
      </nav>
    </details>
  );
}
