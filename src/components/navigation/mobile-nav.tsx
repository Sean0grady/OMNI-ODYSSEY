"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, PlusCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SearchInput } from "@/components/navigation/search-input";
import { PRIMARY_NAV_LINKS } from "@/lib/constants/navigation";
import { signOutAction } from "@/features/auth/actions/sign-out";
import type { UserProfile } from "@/types/domain";

interface MobileNavProps {
  currentUser: UserProfile | null;
}

export function MobileNav({ currentUser }: MobileNavProps) {
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

          <Separator />

          {currentUser ? (
            <div className="flex flex-col gap-1">
              <p className="px-3 text-xs text-muted-foreground">
                Signed in as @{currentUser.username}
              </p>
              <Link
                href={`/users/${currentUser.username}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <User className="size-4" aria-hidden="true" />
                View profile
              </Link>
              <Button
                variant="ghost"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  setOpen(false);
                  signOutAction();
                }}
              >
                <LogOut aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                render={<Link href="/sign-in" />}
              >
                Sign in
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                render={<Link href="/sign-up" />}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
