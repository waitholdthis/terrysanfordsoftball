# Terry Sanford Softball

A Terry Sanford–branded clone of the Foundry baseball/softball dugout command center.

## Open the project

- `index.html` — branded public landing page
- `app.html` — feature and install page
- `ts-softball.html` — the live scorekeeping application

For install/offline behavior, serve the folder from a local or hosted web server rather than opening the HTML file directly.

## Branding

- Product name: Terry Sanford Softball
- Short name: TS Softball
- Primary colors: navy `#061f43`, red `#d50046`, and white
- Source logo: `icons/ts-logo.png`
- Install icons: `icons/icon-192.png` and `icons/icon-512.png`

The clone uses its own browser storage (`ts_softball_v1`), audio database (`ts_softball_audio`), and offline cache (`ts-softball-v3`) so it does not overwrite data from the original app.

## Free enhanced announcer

PA Announcer Mode now includes Kokoro Enhanced voices with no API key or per-use fee. Choose a voice, then use **Download & Test Voice** or **Prepare Roster** while online. Prepared player announcements are saved in the app's local audio database and play offline during games. If an announcement has not been prepared, the app immediately uses the selected device voice instead of delaying the game.

Kokoro is loaded from the pinned `kokoro-js@1.2.1` browser package and uses the quantized compatibility model for consistent phone support. The first model preparation requires internet access and may take several minutes depending on the device.
