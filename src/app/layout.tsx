import type { Metadata } from "next";
import { Archivo, Zilla_Slab } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

/**
 * Archivo carries both a weight and a width axis, which is what lets label
 * rows condense the way real certification labels do (narrow stock, every
 * field has to fit) while the grade numeral sets heavy and wide.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/** Long-form reading only: descriptions, review bodies, entry notes. */
const zillaSlab = Zilla_Slab({
  variable: "--font-zilla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const DIRECTION_CONTRACT = `<!--
  THESIS: Every reading order is a graded, certified artifact. Refuses the
  neutral cover-grid the comics-database category always ships.

  OWN-WORLD: CGC encapsulation and the Overstreet guide. Certification bands —
  universal blue, signature yellow, restored purple, qualified green — on label
  stock; deep ink navy for dark, never black. Hard acrylic, recessed well, foil
  strip, four-colour art. Archivo (weight + width axes) for labels and grades;
  Zilla Slab for reading.

  STORY: A newcomer sees a route through continuity presented as a certified
  object with a grade and a spelled-out physical breakdown, trusts it, starts.

  FIRST VIEWPORT: Full-bleed. One oversized angled slab, cover blazing through
  the acrylic, an enormous overall grade on the label, BINDING / PAPER /
  MAPPING / EXTRAS ruled beneath it, primary action on the label itself.

  FORM: The Slab — candidate 3 of 7 grounded directions; seed key 615da846.

  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md
-->`;

export const metadata: Metadata = {
  title: {
    default: "Omni Odyssey",
    template: "%s · Omni Odyssey",
  },
  description:
    "Certified reading orders through collected comics — graded on binding, paper, mapping, and extras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${zillaSlab.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <div dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
