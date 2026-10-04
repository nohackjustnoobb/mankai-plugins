# MangaDex

This plugin supports browsing, title and author search, genre and status filters, suggestions, manga details, library update checks, and chapter images. It uses the public [MangaDex API](https://api.mangadex.org/docs/) without an account.

## Settings

- **Chapter languages:** Comma-separated MangaDex language codes in title preference order. The default is `en`. Use `zh-hk` for Traditional Chinese, `zh` for Simplified Chinese, or multiple codes such as `en,zh-hk`. Titles prefer the configured languages, then English.
- **Image quality:** Original images or smaller data-saver images.
- **Include mature titles:** Include erotica and pornographic titles in browsing and search. The Mature genre explicitly searches those ratings.

## Chapters and updates

Chapter lists include readable, published chapters hosted on MangaDex. External, unavailable, and empty chapters are excluded. Each chapter keeps its translation language and scanlation group credits. Details link back to MangaDex.

Library update checks fetch manga metadata in batches of up to 100 IDs and compare the latest uploaded chapter ID with the saved chapter ID. MangaDex's latest-upload ID covers all languages, so uploads in any language can trigger updates. Chapter reading still uses the configured languages.

MangaDex limits chapter feeds to 10,000 results.
