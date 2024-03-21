# Fateseal

This is a simple utility website that takes an MTG decklist and exports a Tabletop Simulator compatible JSON file. That's it!

## Running locally

This website will eventually be hosted, but for now it can be run locally. All that is necessary is cloning the repository and running the following commands:

```shell

$ npm install
$ npm run dev

```

Then you just need to navigate to `localhost:3000` and the app is available to use.

## Data processing with bun

I previously used jq for quick data processing, but switched over to a script using Bun for better readability. It takes a little longer, but is much easier to maintain. Currently, the 2GB bulk data dump gets converted down into a 20MB JSON.

## jq for data processing (old)

I downloaded Scryfall's bulk dataset of "Unique Cards" as the initial JSON dump to work from. I parsed it down to to size from 187 to about 5mb with `jq`:

```shell
$ cat "Unique Cards 20240318.json" | jq -c '[.[] | { name: .name, id: .id, imageUrl: .image_uris.large }]' > cards.json
```

Here's current pipeline:

```
$ jq '[.[] | select(.legalities.commander == "legal")]' "Unique Artwork 2024.json" > filtered_output.json
$ jq '[.[] | {name, imageUris: .image_uris, allParts: .all_parts, set, collector_number}]' filtered_output.json > slimmed_output.json
$ jq 'reduce .[] as $item ({};
    .[$item.name] += {
        name: $item.name,
        cards: (.[$item.name].cards + { ($item.set + $item.collector_number): { allParts: (if $item.allParts then $item.allParts | map(select(.component != "combo_piece")) else null end), imageUrl: $item.imageUris.large } })
    }
) | map(.)' slimmed_output.json > collected_output.json
```

## Acknowledgements

MTG-related SVGs courtesy of [Investigamer/mtg-vectors](https://github.com/Investigamer/mtg-vectors)
