export interface NavLink {
  label: string;
  href: string;
}

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: "Discover", href: "/discover" },
  { label: "Reviews", href: "/reviews" },
  { label: "About", href: "/about" },
];
