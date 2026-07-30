import type {
  Publisher,
  ReadingOrderCategory,
  ReadingOrderEntryType,
} from "@/types/domain";

export const PUBLISHER_LABELS: Record<Publisher, string> = {
  marvel: "Marvel",
  dc: "DC",
  image: "Image",
  "dark-horse": "Dark Horse",
  idw: "IDW",
  "boom-studios": "Boom Studios",
  dynamite: "Dynamite",
  viz: "Viz",
  kodansha: "Kodansha",
  other: "Other",
};

export const PUBLISHERS = Object.keys(PUBLISHER_LABELS) as Publisher[];

export const READING_ORDER_CATEGORY_LABELS: Record<
  ReadingOrderCategory,
  string
> = {
  character: "Character",
  team: "Team",
  creator: "Creator",
  event: "Event",
  era: "Era",
  universe: "Universe",
  publisher: "Publisher",
  "manga-series": "Manga Series",
  custom: "Custom",
};

export const READING_ORDER_CATEGORIES = Object.keys(
  READING_ORDER_CATEGORY_LABELS
) as ReadingOrderCategory[];

export const READING_ORDER_ENTRY_TYPE_LABELS: Record<
  ReadingOrderEntryType,
  string
> = {
  "collected-edition": "Collected Edition",
  "individual-issue": "Individual Issue",
  "story-arc": "Story Arc",
  "reading-note": "Reading Note",
  "optional-material": "Optional Material",
};

export const READING_ORDER_ENTRY_TYPES = Object.keys(
  READING_ORDER_ENTRY_TYPE_LABELS
) as ReadingOrderEntryType[];
