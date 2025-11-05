import React, { useMemo } from 'react';

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function FieldRow({ field, onChangeField, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input className="col-span-5 px-2 py-1 border rounded" placeholder="name" value={field.name} onChange={(e) => onChangeField({ ...field, name: e.target.value })} />
      <select className="col-span-4 px-2 py-1 border rounded" value={field.type} onChange={(e) => onChangeField({ ...field, type: e.target.value })}>
        <option>string</option>
        <option>number</option>
        <option>boolean</option>
        <option>object</option>
        <option>array</option>
      </select>
      <label className="col-span-2 inline-flex items-center gap-1 text-sm">
        <input type="checkbox" checked={field.required} onChange={(e) => onChangeField({ ...field, required: e.target.checked })} /> required
      </label>
      <button className="col-span-1 text-red-600" onClick={onRemove}>✕</button>
    </div>
  );
}

function FieldsEditor({ title, fields, onChange }) {
  const addField = () => onChange([ ...fields, { name: '', type: 'string', required: false } ]);
  const updateField = (idx, value) => {
    const next = fields.slice();
    next[idx] = value;
    onChange(next);
  };
  const removeField = (idx) => onChange(fields.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200" onClick={addField}>Add field</button>
      </div>
      <div className="space-y-2">
        {fields.map((f, i) => (
          <FieldRow key={i} field={f} onChangeField={(val) => updateField(i, val)} onRemove={() => removeField(i)} />
        ))}
        {fields.length === 0 && <div className="text-xs text-slate-500">No fields yet</div>}
      </div>
    </div>
  );
}

export default function EndpointEditor({ endpoint, onChange }) {
  const update = (patch) => onChange({ ...endpoint, ...patch });

  const samplePath = useMemo(() => {
    const parts = endpoint.path?.split('/') || [];
    return parts.map(p => p.startsWith(':') ? `{${p.slice(1)}}` : p).join('/');
  }, [endpoint.path]);

  if (!endpoint) return (
    <div className="h-full flex items-center justify-center text-slate-500">Select an endpoint to edit</div>
  );

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      <div className="grid grid-cols-12 gap-3">
        <select className="col-span-2 px-2 py-2 border rounded" value={endpoint.method} onChange={(e) => update({ method: e.target.value })}>
          {httpMethods.map(m => <option key={m}>{m}</option>)}
        </select>
        <input className="col-span-8 px-3 py-2 border rounded" placeholder="/users/:id" value={endpoint.path} onChange={(e) => update({ path: e.target.value })} />
        <input className="col-span-2 px-3 py-2 border rounded" placeholder="Name" value={endpoint.name || ''} onChange={(e) => update({ name: e.target.value })} />
      </div>

      <div className="text-xs text-slate-500">Example path: {samplePath || '/'}</div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <FieldsEditor title="Query/Path Parameters" fields={endpoint.inputs?.params || []} onChange={(v) => update({ inputs: { ...endpoint.inputs, params: v } })} />
          <FieldsEditor title="Request Body" fields={endpoint.inputs?.body || []} onChange={(v) => update({ inputs: { ...endpoint.inputs, body: v } })} />
        </div>
        <div className="space-y-3">
          <FieldsEditor title="Response Fields" fields={endpoint.outputs?.fields || []} onChange={(v) => update({ outputs: { ...endpoint.outputs, fields: v } })} />
          <div>
            <div className="font-medium mb-2">Mock Response (JSON)</div>
            <textarea
              className="w-full h-40 border rounded p-2 font-mono text-sm"
              placeholder="{\n  \"id\": 1,\n  \"name\": \"Alice\"\n}"
              value={endpoint.mockResponse}
              onChange={(e) => update({ mockResponse: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
