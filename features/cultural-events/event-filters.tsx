"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { hasFilters, type Fee, type FilterOptions, type Filters } from "./filters";
import { eventsHref } from "./href";
import type { View } from "./period";

const ALL = "all";

const FEE_ITEMS = [
  { value: ALL, label: "유료·무료 전체" },
  { value: "free", label: "무료" },
  { value: "paid", label: "유료" },
];

export function EventFilters({
  view,
  anchor,
  filters,
  options,
}: {
  view: View;
  anchor: string;
  filters: Filters;
  options: FilterOptions;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(filters.q ?? "");

  const update = (next: Filters) => router.push(eventsHref(view, anchor, next), { scroll: false });

  const categoryItems = [{ value: ALL, label: "분류 전체" }, ...options.categories.map((c) => ({ value: c, label: c }))];
  const districtItems = [{ value: ALL, label: "자치구 전체" }, ...options.districts.map((d) => ({ value: d, label: d }))];

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      role="search"
      aria-label="행사 필터"
      onSubmit={(event) => {
        event.preventDefault();
        update({ ...filters, q: keyword.trim() || undefined });
      }}
    >
      <Select
        items={categoryItems}
        value={filters.category ?? ALL}
        onValueChange={(value) => update({ ...filters, category: value === ALL ? undefined : (value ?? undefined) })}
      >
        <SelectTrigger aria-label="분류" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {categoryItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        items={FEE_ITEMS}
        value={filters.fee ?? ALL}
        onValueChange={(value) => update({ ...filters, fee: value === ALL ? undefined : (value as Fee) })}
      >
        <SelectTrigger aria-label="요금" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {FEE_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        items={districtItems}
        value={filters.district ?? ALL}
        onValueChange={(value) => update({ ...filters, district: value === ALL ? undefined : (value ?? undefined) })}
      >
        <SelectTrigger aria-label="자치구" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {districtItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="relative min-w-40 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="행사명 검색"
          aria-label="행사명 검색"
          className="pl-8"
        />
      </div>

      {hasFilters(filters) && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setKeyword("");
            update({});
          }}
        >
          <XIcon data-icon="inline-start" />
          초기화
        </Button>
      )}
    </form>
  );
}
