"use client";

import { HoverCard, Text } from "@mantine/core";
import Link from "next/link";

function InfoHoverCard() {
  return (
    <div className="flex flex-col gap-1">
      <HoverCard width={350} shadow="md">
        <HoverCard.Target>
          <p className="mb-0 mt-[10px] text-lg font-semibold text-slate-400">
            what is this?
          </p>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="md">
            Fateseal is a deck exporter that formats decklists into a Tabletop
            Simulator compatible JSON file.
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </div>
  );
}

export default InfoHoverCard;
