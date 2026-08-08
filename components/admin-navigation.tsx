"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/makaleler", label: "Makaleler" },
  { href: "/admin/randevu-talepleri", label: "Randevu talepleri" },
];

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Yönetim paneli">
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === link.href
              : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold ${active ? "text-primary bg-white shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
