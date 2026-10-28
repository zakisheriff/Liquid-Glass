# Interface assets

The interface symbols in `demo/public/symbols` and the search/clear masks in
`src/components/internal/inputSymbols.ts` are Apple SF Symbols, rendered from
the installed macOS system symbols at six times their display resolution.
Symbol names are retained in the filenames. They use CSS masks to inherit the
interface colour without requiring an Apple font on the visitor's device.

SF Symbols are © Apple Inc. All rights reserved and remain subject to Apple's
applicable terms; they are not covered by this repository's MIT code license.
Source: https://developer.apple.com/sf-symbols/
