# Source and provenance

This module preserves the action interface and operating concept of **Lethe**, created by Peter Bournakas (`pbrns/Lethe`).

- Upstream repository: https://github.com/pbrns/Lethe
- Upstream revision reviewed: `46e9520a515e9efac4908f43dac5ac5d641af08a`
- Upstream skill name: `memory-tool`
- Upstream license notice: Apache License 2.0

The JavaScript runner in this fork is a compact rewrite for a multi-skill repository. It retains the compatible actions `save_memory`, `get_context`, `get_memories`, `search_memories`, `delete_memory`, and `wipe_memories`, while storing transparent JSON locally and avoiding external runtime dependencies.

The upstream project and author remain credited here so later merges can distinguish original design lineage from fork-specific implementation changes.
