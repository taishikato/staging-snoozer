"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Services" },
    { href: "/rules", label: "Rules" },
  ];

  return (
    <nav className="border-b">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex h-16 items-center space-x-8">
          <Link href="/" className="font-bold text-xl">
            Staging Snoozer
          </Link>
          <div className="flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
