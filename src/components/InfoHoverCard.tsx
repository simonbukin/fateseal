"use client";

import { HoverCard, Button, Text } from "@mantine/core";

function InfoHoverCard() {
  return (
    <HoverCard width={350} shadow="md">
      <HoverCard.Target>
        <p className="text-lg font-semibold text-slate-400">
          what is this?
        </p>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="md">
          Fateseal is a deck exporter that formats decklists into a
          Tabletop Simulator compatible JSON file.
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default InfoHoverCard;
