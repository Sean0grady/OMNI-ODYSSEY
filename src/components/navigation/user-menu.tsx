"use client";

import Link from "next/link";
import { LogOut, PlusCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollectorAvatar } from "@/components/shared/collector-avatar";
import { signOutAction } from "@/features/auth/actions/sign-out";
import type { UserProfile } from "@/types/domain";

interface UserMenuProps {
  currentUser: UserProfile | null;
}

export function UserMenu({ currentUser }: UserMenuProps) {
  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
          Sign in
        </Button>
        <Button variant="outline" size="sm" render={<Link href="/sign-up" />}>
          Sign up
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${currentUser.displayName}`}
        render={<Button variant="ghost" size="icon" className="rounded-full" />}
      >
        <CollectorAvatar
          displayName={currentUser.displayName}
          avatarUrl={currentUser.avatarUrl}
          size="sm"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-1.5 py-1.5">
            <span className="text-sm font-medium text-foreground">
              {currentUser.displayName}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              @{currentUser.username}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href={`/users/${currentUser.username}`} />}
        >
          <User aria-hidden="true" />
          View profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/reading-orders/create" />}>
          <PlusCircle aria-hidden="true" />
          Create reading order
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
