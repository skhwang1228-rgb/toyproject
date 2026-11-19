"use client";

import type { ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/** 달력을 접고 펼치는 껍데기. 월간 보기에서는 펼쳐 두고 주간 보기에서는 접어 둔다. */
export function CalendarPanel({ defaultOpen, children }: { defaultOpen: boolean; children: ReactNode }) {
  return (
    <Accordion defaultValue={defaultOpen ? ["calendar"] : []} className="rounded-lg border px-3">
      <AccordionItem value="calendar" className="border-b-0">
        <AccordionTrigger>달력</AccordionTrigger>
        <AccordionContent className="[&_a]:no-underline">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
