import React, { useMemo, useState } from 'react';
import { Play } from 'lucide-react';

function generateSampleValue(type) {
  switch (type) {
    case 'number': return Math.floor(Math.random() * 100);
    case 'boolean': return Math.random() > 0.5;
    case 'object': return { sample: true };
    case 'array': return [1,2,3];
    default: return 'sample';
  }
}

function buildResponseFromFields(fields = []) {
  const obj = {};
  fields.forEach(f => {
    obj[f.name || 'field'] = generateSampleValue(f.type);
  });
  return obj;
}

export default function MockTester({ endpoint }) {
  const [paramsJson, setParamsJson] = useState('{}');
  const [bodyJson, setBodyJson] = useState('{}');
  const [result, setResult] = useState(null);
  const [latency, setLatency] = useState(null);

  const canRun = !!endpoint;

  const run = async () => {
    if (!endpoint) return;
    const start = performance.now();
    await new Promise(r => setTimeout(r, 200 + Math.random() * 400));

    try {
      let payload = endpoint.mockResponse?.trim();
      let data;
      if (payload) {
        data = JSON.parse(payload);
      } else {
        data = buildResponseFromFields(endpoint.outputs?.fields);
      }
      setResult({ ok: true, data });
    } catch (e) {
      setResult({ ok: false, error: 'Invalid mock JSON' });
    } finally {
      setLatency(Math.round(performance.now() - start));
    }
  };

  const methodColor = useMemo(() => ({
    GET: 'bg-emerald-100 text-emerald-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    PATCH: 'bg-violet-100 text-violet-700',
    DELETE: 'bg-rose-100 text-rose-700'
  })[endpoint?.method || 'GET'], [endpoint?.method]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded ${methodColor}`}>{endpoint?.method || 'GET'}</span>
          <div className="font-medium">{endpoint?.path || '/'}</div>
        </div>
        <button
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-white ${canRun ? 'bg-slate-900 hover:opacity-90' : 'bg-slate-400 cursor-not-allowed'}`}
          onClick={run}
          disabled={!canRun}
        >
          <Play className="w-4 h-4" /> Run Mock
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <div className="font-medium mb-2">Params (JSON)</div>
          <textarea className="w-full h-40 border rounded p-2 font-mono text-sm" value={paramsJson} onChange={(e) => setParamsJson(e.target.value)} />
        </div>
        <div>
          <div className="font-medium mb-2">Body (JSON)</div>
          <textarea className="w-full h-40 border rounded p-2 font-mono text-sm" value={bodyJson} onChange={(e) => setBodyJson(e.target.value)} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex-1 overflow-auto">
        <div className="text-xs text-slate-500 mb-2">Latency: {latency ? `${latency} ms` : 'N/A'}</div>
        {!result && <div className="text-sm text-slate-500">Run to see a mock response</div>}
        {result && result.ok && (
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
        )}
        {result && !result.ok && (
          <div className="text-sm text-rose-600">{result.error}</div>
        )}
      </div>
    </div>
  );
}
