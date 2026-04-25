// Wave 8 P1 (W8-3) — PropTable. Server-rendered React island that
// reads a per-component entry from `@freecodecamp/uikit/props.json`
// and renders an HTML <table> inside the showcase anatomy <details>
// block. No `client:` directive — this is plain SSR markup, no
// runtime cost.
//
// Generic-heavy components (DataTable<TRow>, FormStepper) may surface
// with `_extractionFailed: true` from the generator (R1, styleguidist
// #203). When that flag is set, we render a fallback note instead of
// an empty table.
import React from 'react';

export interface PropEntryProp {
  type: string;
  required: boolean;
  description: string;
  defaultValue: string | null;
}

export interface PropEntry {
  displayName: string;
  description: string;
  props: Record<string, PropEntryProp>;
  _extractionFailed?: boolean;
}

export interface PropTableProps {
  entry: PropEntry;
}

function defaultDisplay(value: string | null): string {
  if (value == null) return '—';
  // Collapse multi-line default values (DataTable's `defaultRowId`
  // ships a stringified arrow function). Show the first line; full
  // signature lives in source.
  const first = value.split('\n')[0].trim();
  return first.length > 60 ? `${first.slice(0, 60)}…` : first;
}

export function PropTable({ entry }: PropTableProps): React.ReactElement {
  if (entry._extractionFailed) {
    return (
      <div className='prop-table prop-table--unavailable'>
        <p className='prop-table__note'>
          Prop signature unavailable for generic components; see source.
        </p>
      </div>
    );
  }

  const rows = Object.entries(entry.props);

  return (
    <table className='prop-table'>
      <thead>
        <tr>
          <th scope='col'>Prop</th>
          <th scope='col'>Type</th>
          <th scope='col'>Required</th>
          <th scope='col'>Default</th>
          <th scope='col'>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, def]) => (
          <tr key={name} className='prop-table__row'>
            <td className='prop-table__name'>
              <code>{name}</code>
            </td>
            <td className='prop-table__type'>
              <code>{def.type}</code>
            </td>
            <td
              className='prop-table__required'
              data-required={def.required ? 'true' : 'false'}
            >
              {def.required ? 'yes' : 'no'}
            </td>
            <td className='prop-table__default'>
              <code>{defaultDisplay(def.defaultValue)}</code>
            </td>
            <td className='prop-table__description'>{def.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
