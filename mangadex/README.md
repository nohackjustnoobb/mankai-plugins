# MangaDex

This plugin supports browsing, title and author search, genre and status filters, suggestions, manga details, batch manga lookup, library update checks, and chapter images. It uses the public [MangaDex API](https://api.mangadex.org/docs/) without an account.

## Settings

- **Chapter languages:** Comma-separated MangaDex language codes in title preference order. The default is `en`. Use `zh-hk` for Traditional Chinese, `zh` for Simplified Chinese, or multiple codes such as `en,zh-hk`. Titles prefer the configured languages, then English.
- **Image quality:** Original images or smaller data-saver images.
- **Include mature titles:** Include erotica and pornographic titles in browsing and search. The Mature genre explicitly searches those ratings.

## Chapters and updates

Chapter lists include readable, published chapters hosted on MangaDex. External, unavailable, and empty chapters are excluded. Each chapter keeps its translation language and scanlation group credits. Details link back to MangaDex.

List results keep the chapter title for display when MangaDex provides a chapter number without a latest-upload ID. Batch lookup and update checks require a latest-upload ID to return a latest chapter.

Batch manga lookup fetches metadata in batches of up to 100 unique IDs, includes all content ratings, and returns found titles in the requested order. Missing titles are omitted.

Library update checks share the batched metadata requests and compare only the latest uploaded chapter ID with the saved chapter ID. A chapter number without an upload ID does not trigger an update. MangaDex's latest-upload ID covers all languages, so uploads in any language can trigger updates. Chapter reading still uses the configured languages.

MangaDex limits chapter feeds to 10,000 results.
