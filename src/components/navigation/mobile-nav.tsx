"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchInput } from "@/components/navigation/search-input";
import { PRIMARY_NAV_LINKS } from "@/lib/constants/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        render={<Button variant="ghost" size="icon" className="lg:hidden" />}
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Omni Odyssey</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <SearchInput />
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Button
              className="mt-1"
              onClick={() => setOpen(false)}
              render={<Link href="/reading-orders/create" />}
            >
              <PlusCircle aria-hidden="true" />
              Create Reading Order
            </Button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
