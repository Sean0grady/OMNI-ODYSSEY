"use client";

import Link from "next/link";
import { PlusCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollectorAvatar } from "@/components/shared/collector-avatar";
import { getCurrentUser } from "@/lib/repositories";

export function UserMenu() {
  const currentUser = getCurrentUser();

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
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-1.5 py-1.5">
          <span className="text-sm font-medium text-foreground">
            {currentUser.displayName}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            @{currentUser.username} · demo account, not real auth
          </span>
        </DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
