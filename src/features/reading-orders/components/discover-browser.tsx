"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReadingOrderCard } from "@/components/reading-orders/reading-order-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  PUBLISHERS,
  PUBLISHER_LABELS,
  READING_ORDER_CATEGORIES,
  READING_ORDER_CATEGORY_LABELS,
} from "@/lib/constants/catalog";
import {
  READING_ORDER_SORT_LABELS,
  READING_ORDER_SORT_OPTIONS,
  type ReadingOrderSortOption,
} from "@/features/reading-orders/types/search";
import { filterAndSortReadingOrders } from "@/features/reading-orders/utils/filter-sort";
import type { ReadingOrderWithCreator } from "@/features/reading-orders/utils/filter-sort";
import type { Publisher, ReadingOrderCategory } from "@/types/domain";

const ALL_VALUE = "all";

interface DiscoverBrowserProps {
  items: ReadingOrderWithCreator[];
  initialQuery?: string;
}

export function DiscoverBrowser({ items, initialQuery = "" }: DiscoverBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const [publisher, setPublisher] = useState<Publisher | typeof ALL_VALUE>(
    ALL_VALUE
  );
  const [category, setCategory] = useState<
    ReadingOrderCategory | typeof ALL_VALUE
  >(ALL_VALUE);
  const [sort, setSort] = useState<ReadingOrderSortOption>("most-saved");

  const hasActiveFilters =
    query.trim().length > 0 ||
    publisher !== ALL_VALUE ||
    category !== ALL_VALUE ||
    sort !== "most-saved";

  const results = useMemo(
    () =>
      filterAndSortReadingOrders(items, {
        query,
        publisher: publisher === ALL_VALUE ? undefined : publisher,
        category: category === ALL_VALUE ? undefined : category,
        sort,
      }),
    [items, query, publisher, category, sort]
  );

  function clearFilters() {
    setQuery("");
    setPublisher(ALL_VALUE);
    setCategory(ALL_VALUE);
    setSort("most-saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="discover-search" className="sr-only">
            Search reading orders
          </label>
          <Input
            id="discover-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, creator, character, team, or publisher…"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal
            className="hidden size-4 text-muted-foreground sm:block"
            aria-hidden="true"
          />
          <Select
            value={publisher}
            onValueChange={(value) =>
              setPublisher(value as Publisher | typeof ALL_VALUE)
            }
          >
            <SelectTrigger
              aria-label="Filter by publisher"
              className="w-[8.5rem] flex-1 sm:w-36 sm:flex-none"
            >
              <SelectValue placeholder="Publisher">
                {(value: Publisher | typeof ALL_VALUE) =>
                  value === ALL_VALUE ? "All publishers" : PUBLISHER_LABELS[value]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All publishers</SelectItem>
              {PUBLISHERS.map((value) => (
                <SelectItem key={value} value={value}>
                  {PUBLISHER_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(value as ReadingOrderCategory | typeof ALL_VALUE)
            }
          >
            <SelectTrigger
              aria-label="Filter by category"
              className="w-[8.5rem] flex-1 sm:w-36 sm:flex-none"
            >
              <SelectValue placeholder="Category">
                {(value: ReadingOrderCategory | typeof ALL_VALUE) =>
                  value === ALL_VALUE
                    ? "All categories"
                    : READING_ORDER_CATEGORY_LABELS[value]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All categories</SelectItem>
              {READING_ORDER_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {READING_ORDER_CATEGORY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as ReadingOrderSortOption)}
          >
            <SelectTrigger
              aria-label="Sort order"
              className="w-[9.5rem] flex-1 sm:w-40 sm:flex-none"
            >
              <SelectValue placeholder="Sort by">
                {(value: ReadingOrderSortOption) =>
                  READING_ORDER_SORT_LABELS[value]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {READING_ORDER_SORT_OPTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {READING_ORDER_SORT_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-muted-foreground" role="status">
        {results.length} reading order{results.length === 1 ? "" : "s"} found
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No reading orders match your search"
          description="Try a different search term, or clear your filters to see everything available."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {results.map(({ order, creator }) => (
            <ReadingOrderCard key={order.id} readingOrder={order} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}
