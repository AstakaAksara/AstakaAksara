```text
# How to add a new word

Use the provided script to add words safely:

- Interactive:
  - node add-word.js
- Non-interactive (useful for scripts / CI):
  - node add-word.js --word "Word" --jawi "جوي" --meaning "Meaning text"

Notes:
- The script ensures the JSON stays valid and prevents duplicate words (case-insensitive).
- By default it edits `AstakaAksara.json` in the current directory. To point to a different file, set the ASTAKA_FILE environment variable:
  - ASTAKA_FILE=path/to/file.json node add-word.js
- If you want entries sorted alphabetically, uncomment the sort line in add-word.js.
```