export type Publisher =
  | "marvel"
  | "dc"
  | "image"
  | "dark-horse"
  | "idw"
  | "boom-studios"
  | "dynamite"
  | "viz"
  | "kodansha"
  | "other";

export type ReadingOrderCategory =
  | "character"
  | "team"
  | "creator"
  | "event"
  | "era"
  | "universe"
  | "publisher"
  | "manga-series"
  | "custom";

export type ReadingOrderVisibility = "public" | "private";

export type ReadingOrderEntryType =
  | "collected-edition"
  | "individual-issue"
  | "story-arc"
  | "reading-note"
  | "optional-material";

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  location?: string;
  favoritePublishers: Publisher[];
  followerCount: number;
  followingCount: number;
  publishedReadingOrderCount: number;
  reviewCount: number;
  createdAt: string;
}

export interface ReadingOrderEntry {
  id: string;
  readingOrderId: string;
  position: number;
  entryType: ReadingOrderEntryType;
  title: string;
  subtitle?: string;
  issueRange?: string;
  coverImageUrl?: string;
  notes?: string;
  isOptional: boolean;
}

export interface ReadingOrder {
  id: string;
  slug: string;
  creatorId: string;
  title: string;
  summary: string;
  description: string;
  coverImageUrl: string;
  publishers: Publisher[];
  categories: ReadingOrderCategory[];
  visibility: ReadingOrderVisibility;
  entries: ReadingOrderEntry[];
  saveCount: number;
  viewCount: number;
  estimatedBookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectedEditionReview {
  id: string;
  authorId: string;
  editionTitle: string;
  publisher: Publisher;
  coverImageUrl: string;
  overallRating: number;
  reviewText: string;
  bindingRating?: number;
  paperQualityRating?: number;
  mappingRating?: number;
  extrasRating?: number;
  createdAt: string;
  updatedAt: string;
}
