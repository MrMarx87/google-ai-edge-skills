# Marx AI Edge Skills

A curated, modular collection of JavaScript skills for the Google AI Edge Gallery. Each skill lives in its own directory under `docs/` so components can be tested independently and later combined into a larger agent toolkit.

## Included skills

### Brave Web Search

Searches the live internet through the Brave Search API.

- Skill source: [`docs/brave-web-search`](docs/brave-web-search)
- Webhost path: `https://mrmarx87.github.io/google-ai-edge-skills/brave-web-search/`
- Secret required: Brave Search API key
- Origin: retained from the `jasonssl/google-ai-edge-skills` fork lineage

### Persistent Memory Tool

Stores user-approved facts, preferences, and project context in local device storage, then retrieves them across otherwise stateless chat sessions.

- Skill source: [`docs/lethe-memory`](docs/lethe-memory)
- Webhost path: `https://mrmarx87.github.io/google-ai-edge-skills/lethe-memory/`
- Secret required: none
- Compatible actions: `save_memory`, `get_context`, `get_memories`, `search_memories`, `delete_memory`, `wipe_memories`
- Provenance: interface adapted from [`pbrns/Lethe`](https://github.com/pbrns/Lethe); details are recorded in [`SOURCE.md`](docs/lethe-memory/SOURCE.md)

## Repository layout

```text
docs/
├── brave-web-search/
│   ├── SKILL.md
│   └── scripts/
└── lethe-memory/
    ├── SKILL.md
    ├── SOURCE.md
    └── scripts/
```

## Adding another skill

Create one self-contained directory under `docs/<skill-name>/` with:

1. `SKILL.md` containing the skill metadata and agent instructions.
2. `scripts/index.html` as the Google AI Edge Gallery entry page.
3. Any supporting JavaScript or assets inside the same `scripts/` directory.
4. `SOURCE.md` when the skill is adapted from another project, recording its repository, revision, license, and what changed locally.

Keeping skills isolated prevents one experiment from quietly altering another. Shared behavior can later be moved into a deliberate common runtime after the individual modules are tested.

## GitHub Pages

Configure GitHub Pages to deploy from the `main` branch and `/docs` directory. Each skill will then be available at:

```text
https://mrmarx87.github.io/google-ai-edge-skills/<skill-name>/
```

## License

This repository remains licensed under the Apache License 2.0. Individual source notes preserve upstream attribution and revision history.
