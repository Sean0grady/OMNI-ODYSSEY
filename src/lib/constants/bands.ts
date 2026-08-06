import type { CertBand } from "@/components/slab/slab";
import type { ReadingOrderCategory, Publisher } from "@/types/domain";

/**
 * Which certification band a reading order prints on its label.
 *
 * On a real slab the band's colour tells a collector which *kind* of
 * certification they are holding before they read a word, so the mapping is
 * kept semantic rather than decorative. The one that earns itself: a
 * creator-led route prints Signature, because Signature Series is the tier
 * where the creator themselves signed the book.
 */
export const CATEGORY_BAND: Record<ReadingOrderCategory, CertBand> = {
  creator: "signature",
  character: "universal",
  team: "universal",
  universe: "universal",
  event: "restored",
  "manga-series": "restored",
  era: "qualified",
  publisher: "qualified",
  custom: "signature",
};

/**
 * Publisher accent used where a single publisher owns a region of the page.
 * Deliberately not a brand-colour lookup: these are this site's bands, not the
 * publishers' own trade dress.
 */
export const PUBLISHER_BAND: Record<Publisher, CertBand> = {
  marvel: "restored",
  dc: "universal",
  image: "qualified",
  "dark-horse": "qualified",
  idw: "universal",
  "boom-studios": "signature",
  dynamite: "restored",
  viz: "signature",
  kodansha: "restored",
  other: "universal",
};
