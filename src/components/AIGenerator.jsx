import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildCrudFromPrompt(prompt) {
  const base = slugify(prompt || 'resource');
  const name = base.replace(/-/g, ' ');
  const folderId = `fld_${crypto.randomUUID()}`;

  const endpoints = [
    { name: `List ${name}`, method: 'GET', path: `/${base}`, inputs: { params: [{ name: 'page', type: 'number' }, { name: 'limit', type: 'number' }] }, outputs: { fields: [{ name: 'items', type: 'array' }, { name: 'total', type: 'number' }] }, mockResponse: '{"items": [], "total": 0}' },
    { name: `Get ${name} by id`, method: 'GET', path: `/${base}/:id`, inputs: { params: [{ name: 'id', type: 'string', required: true }] }, outputs: { fields: [{ name: 'id', type: 'string' }, { name: 'name', type: 'string' }] }, mockResponse: '{"id": "1", "name": "Sample"}' },
    { name: `Create ${name}`, method: 'POST', path: `/${base}`, inputs: { body: [{ name: 'name', type: 'string', required: true }] }, outputs: { fields: [{ name: 'id', type: 'string' }, { name: 'name', type: 'string' }] }, mockResponse: '{"id": "new", "name": "Sample"}' },
    { name: `Update ${name}`, method: 'PUT', path: `/${base}/:id`, inputs: { params: [{ name: 'id', type: 'string', required: true }], body: [{ name: 'name', type: 'string' }] }, outputs: { fields: [{ name: 'success', type: 'boolean' }] }, mockResponse: '{"success": true}' },
    { name: `Delete ${name}`, method: 'DELETE', path: `/${base}/:id`, inputs: { params: [{ name: 'id', type: 'string', required: true }] }, outputs: { fields: [{ name: 'success', type: 'boolean' }] }, mockResponse: '{"success": true}' },
  ];

  return { folder: { id: folderId, type: 'folder', name: name.charAt(0).toUpperCase() + name.slice(1), children: [] }, endpoints };
}

export default function AIGenerator({ onGenerate }) {
  const [prompt, setPrompt] = useState('User profiles with CRUD');
  const [loading, setLoading] = useState(false);
  const [useLocal, setUseLocal] = useState(true);
  const [error, setError] = useState(null);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!useLocal && import.meta.env.VITE_BACKEND_URL) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        onGenerate(data);
      } else {
        const { folder, endpoints } = buildCrudFromPrompt(prompt);
        onGenerate({ folder, endpoints });
      }
    } catch (e) {
      setError(e.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="font-medium flex items-center gap-2"><Wand2 className="w-4 h-4" /> AI Generator</div>
        <label className="text-xs inline-flex items-center gap-2">
          <input type="checkbox" checked={useLocal} onChange={(e) => setUseLocal(e.target.checked)} /> Use local generator
        </label>
      </div>
      <div className="p-3 space-y-3">
        <textarea
          className="w-full h-28 border rounded p-2 text-sm"
          placeholder='Describe the route you want (e.g., "Bookings with date, guest count, and status")'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" disabled={loading} onClick={submit}>
            <Wand2 className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate'}
          </button>
          {error && <div className="text-xs text-rose-600">{error}</div>}
        </div>
        <div className="text-xs text-slate-500">Use the generator to quickly scaffold a folder with CRUD endpoints. You can edit everything afterwards.</div>
      </div>
    </div>
  );
}
