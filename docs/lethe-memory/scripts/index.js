'use strict';

const STORAGE_KEY = 'lethe_memory_tool_v2_json';
const EMPTY_STORE = () => ({ version: 2, nextId: 1, memories: [] });

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE();

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.memories)) return EMPTY_STORE();

    return {
      version: 2,
      nextId: Number.isInteger(parsed.nextId) && parsed.nextId > 0
        ? parsed.nextId
        : parsed.memories.length + 1,
      memories: parsed.memories
        .filter((memory) => memory && typeof memory === 'object')
        .map((memory) => ({
          id: String(memory.id || ''),
          title: String(memory.title || ''),
          content: String(memory.content || ''),
          tags: Array.isArray(memory.tags) ? memory.tags.map(String) : [],
          created: String(memory.created || new Date(0).toISOString()),
          updated: String(memory.updated || memory.created || new Date(0).toISOString()),
        })),
    };
  } catch (error) {
    console.error('[memory-tool] Unable to read local storage:', error);
    return EMPTY_STORE();
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    throw new Error(`Unable to save local memory: ${error.message}`);
  }
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTags(value) {
  const input = Array.isArray(value) ? value.join(',') : String(value || '');
  return [...new Set(
    input
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )];
}

function createId(store) {
  const sequence = store.nextId++;
  return `mem-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function saveMemory({ title, content, tags }) {
  const cleanTitle = cleanText(title);
  const cleanContent = cleanText(content);
  if (!cleanTitle) throw new Error('Title is required.');
  if (!cleanContent) throw new Error('Content is required.');

  const store = readStore();
  const now = new Date().toISOString();
  const memory = {
    id: createId(store),
    title: cleanTitle,
    content: cleanContent,
    tags: normalizeTags(tags),
    created: now,
    updated: now,
  };

  store.memories.push(memory);
  writeStore(store);
  return `Memory saved: "${memory.title}" [${memory.id}]`;
}

function listMemories(memories = readStore().memories) {
  if (!memories.length) return 'No stored memories.';

  return memories
    .map((memory) => {
      const tags = memory.tags.length ? ` [${memory.tags.join(', ')}]` : '';
      return `[${memory.id}] ${memory.title}${tags}\n${memory.content}`;
    })
    .join('\n\n');
}

function getContext() {
  const memories = readStore().memories;
  if (!memories.length) {
    return 'No stored memories found. The user has not saved any memories yet.';
  }

  const header = `[Memory Tool: ${memories.length} stored memories retrieved ${new Date().toISOString()}]`;
  const body = memories.map((memory, index) => {
    const tags = memory.tags.length ? ` [${memory.tags.join(', ')}]` : '';
    return `### Memory ${index + 1}: ${memory.title}${tags}\n${memory.content}\n(id: ${memory.id}; saved: ${memory.created})`;
  });

  return [header, '', ...body, '', '[End of persistent memory context.]'].join('\n');
}

function searchMemories(query) {
  const cleanQuery = cleanText(query).toLowerCase();
  if (!cleanQuery) throw new Error('Query is required.');

  const hits = readStore().memories.filter((memory) =>
    memory.title.toLowerCase().includes(cleanQuery) ||
    memory.content.toLowerCase().includes(cleanQuery) ||
    memory.tags.some((tag) => tag.includes(cleanQuery))
  );

  return hits.length
    ? listMemories(hits)
    : `No memories found matching "${cleanText(query)}".`;
}

function deleteMemory(id) {
  const cleanId = cleanText(id);
  if (!cleanId) throw new Error('Memory id is required.');

  const store = readStore();
  const index = store.memories.findIndex((memory) => memory.id === cleanId);
  if (index < 0) return `No memory found with id "${cleanId}".`;

  const [deleted] = store.memories.splice(index, 1);
  writeStore(store);
  return `Memory deleted: "${deleted.title}" [${deleted.id}]`;
}

function wipeMemories() {
  localStorage.removeItem(STORAGE_KEY);
  return 'All stored memories were permanently erased.';
}

window['ai_edge_gallery_get_result'] = async (dataStr) => {
  try {
    const input = typeof dataStr === 'string'
      ? JSON.parse(dataStr || '{}')
      : (dataStr || {});
    const action = cleanText(input.action).toLowerCase();
    let result;

    switch (action) {
      case 'save_memory':
        result = saveMemory(input);
        break;
      case 'get_context':
      case 'context':
        result = getContext();
        break;
      case 'get_memories':
      case 'list_memories':
        result = listMemories();
        break;
      case 'search_memories':
      case 'search':
        result = searchMemories(input.query);
        break;
      case 'delete_memory':
      case 'remove_memory':
        result = deleteMemory(input.id);
        break;
      case 'wipe_memories':
      case 'clear_memories':
        result = wipeMemories();
        break;
      case 'count':
        result = `${readStore().memories.length} memories stored.`;
        break;
      default:
        throw new Error(
          `Unknown action "${action}". Use save_memory, get_context, get_memories, search_memories, delete_memory, or wipe_memories.`
        );
    }

    render();
    return JSON.stringify({ result });
  } catch (error) {
    console.error('[memory-tool]', error);
    return JSON.stringify({ error: `Memory Tool error: ${error.message}` });
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setStatus(message) {
  const status = document.getElementById('status');
  if (status) status.textContent = message;
}

function clearForm() {
  for (const id of ['title', 'content', 'tags']) {
    const element = document.getElementById(id);
    if (element) element.value = '';
  }
}

function render() {
  if (!document.body) return;

  const store = readStore();
  const searchValue = cleanText(document.getElementById('search')?.value).toLowerCase();
  const memories = searchValue
    ? store.memories.filter((memory) =>
        memory.title.toLowerCase().includes(searchValue) ||
        memory.content.toLowerCase().includes(searchValue) ||
        memory.tags.some((tag) => tag.includes(searchValue))
      )
    : store.memories;

  const memoryCount = document.getElementById('memoryCount');
  const tagCount = document.getElementById('tagCount');
  const memoryList = document.getElementById('memoryList');

  if (memoryCount) memoryCount.textContent = String(store.memories.length);
  if (tagCount) {
    tagCount.textContent = String(new Set(store.memories.flatMap((memory) => memory.tags)).size);
  }
  if (!memoryList) return;

  if (!memories.length) {
    memoryList.innerHTML = `<div class="empty">${searchValue ? 'No matching memories.' : 'No memories saved yet.'}</div>`;
    return;
  }

  memoryList.innerHTML = [...memories]
    .reverse()
    .map((memory) => `
      <article class="memory">
        <h3>${escapeHtml(memory.title)}</h3>
        <p>${escapeHtml(memory.content)}</p>
        <div class="meta">
          ${memory.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          <div>${escapeHtml(memory.created)} · ${escapeHtml(memory.id)}</div>
        </div>
        <button class="danger" data-delete-id="${escapeHtml(memory.id)}">Delete</button>
      </article>
    `)
    .join('');

  memoryList.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => {
      setStatus(deleteMemory(button.dataset.deleteId));
      render();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveButton')?.addEventListener('click', () => {
    try {
      const message = saveMemory({
        title: document.getElementById('title')?.value,
        content: document.getElementById('content')?.value,
        tags: document.getElementById('tags')?.value,
      });
      clearForm();
      setStatus(message);
      render();
    } catch (error) {
      setStatus(error.message);
    }
  });

  document.getElementById('clearButton')?.addEventListener('click', clearForm);
  document.getElementById('search')?.addEventListener('input', render);
  document.getElementById('wipeButton')?.addEventListener('click', () => {
    if (!window.confirm('Permanently erase all stored memories?')) return;
    setStatus(wipeMemories());
    render();
  });

  render();
});
