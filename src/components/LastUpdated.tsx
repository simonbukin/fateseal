import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Tooltip } from "@mantine/core";
import { Clock } from "lucide-react";

export function LastUpdated() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetch("/last-updated.json")
      .then((res) => res.json())
      .then((data) => {
        const date = new Date(data.lastUpdated);
        const timeAgo = formatDistanceToNow(date, { addSuffix: true });
        setLastUpdated(timeAgo);
      })
      .catch(console.error);
  }, []);

  if (!lastUpdated) return null;

  return (
    <div className="absolute right-3 bottom-3">
      <Tooltip label={`Card database last updated ${lastUpdated}`}>
        <Clock
          size={20}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-help"
        />
      </Tooltip>
    </div>
  );
}
