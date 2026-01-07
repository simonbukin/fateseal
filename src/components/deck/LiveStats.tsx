interface LiveStatsProps {
  cardCount: number;
  tokenCount: number;
  errorCount: number;
}

export function LiveStats({ cardCount, tokenCount, errorCount }: LiveStatsProps) {
  if (cardCount === 0) {
    return <span>Your decklist</span>;
  }

  return (
    <span>
      Your decklist
      <span className="text-green-600 ml-2">{cardCount} cards</span>
      {tokenCount > 0 && (
        <span className="text-blue-600 ml-2">{tokenCount} tokens</span>
      )}
      {errorCount > 0 && (
        <span className="text-red-600 ml-2">{errorCount} errors</span>
      )}
    </span>
  );
}
