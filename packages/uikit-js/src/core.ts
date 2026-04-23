// Core runtime — scans the DOM for [data-uikit-*] hooks and attaches
// the matching adapter. Auto-boots on DOMContentLoaded (or immediately
// if already past that phase) and keeps up with later DOM mutations
// via a single MutationObserver. Designed as a ~3 KB IIFE so vanilla
// consumers can drop one <script> tag and stop thinking about setup.

import { dialog, type DialogInstance } from './adapters/dialog';
import { listbox, type ListboxInstance } from './adapters/listbox';
import { pagination, type PaginationInstance } from './adapters/pagination';

export type Adapter<TInstance = unknown> = (el: HTMLElement) => TInstance;

interface Registration {
  attribute: string;
  adapter: Adapter;
}

const registry: Registration[] = [
  { attribute: 'data-uikit-dialog', adapter: dialog as Adapter },
  { attribute: 'data-uikit-listbox', adapter: listbox as Adapter },
  { attribute: 'data-uikit-pagination', adapter: pagination as Adapter }
];

function bootScope(scope: ParentNode): void {
  for (const { attribute, adapter } of registry) {
    scope
      .querySelectorAll<HTMLElement>(`[${attribute}]`)
      .forEach(el => adapter(el));
  }
  if ((scope as Element).matches) {
    const el = scope as HTMLElement;
    for (const { attribute, adapter } of registry) {
      if (el.matches(`[${attribute}]`)) adapter(el);
    }
  }
}

function bootDocument(): void {
  bootScope(document);
  new MutationObserver(entries => {
    for (const entry of entries) {
      entry.addedNodes.forEach(node => {
        if (node.nodeType === 1) bootScope(node as Element);
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDocument, { once: true });
  } else {
    bootDocument();
  }
}

export { dialog, listbox, pagination };
export type { DialogInstance, ListboxInstance, PaginationInstance };
