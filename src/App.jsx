import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import EndpointEditor from './components/EndpointEditor.jsx';
import MockTester from './components/MockTester.jsx';
import AIGenerator from './components/AIGenerator.jsx';
import { Rocket } from 'lucide-react';

const safeId = (prefix) => {
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return `${prefix}_${globalThis.crypto.randomUUID()}`;
    }
  } catch (_) {}
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now()}`;
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

function createEndpoint(name = 'New Endpoint') {
  return {
    id: safeId('ep'),
    type: 'endpoint',
    name,
    method: 'GET',
    path: '/',
    inputs: { params: [], body: [] },
    outputs: { fields: [] },
    mockResponse: ''
  };
}

function createFolder(name = 'New Folder') {
  return { id: safeId('fd'), type: 'folder', name, children: [] };
}

function findNodeAndParent(tree, id, parent = null, list = tree) {
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (node.id === id) return { node, parent, index: i, list };
    if (node.type === 'folder' && node.children?.length) {
      const found = findNodeAndParent(tree, id, node, node.children);
      if (found) return found;
    }
  }
  return null;
}

export default function App() {
  const [tree, setTree] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    const walk = (list) => {
      for (const n of list) {
        if (n.id === selectedId) return n;
        if (n.type === 'folder' && n.children?.length) {
          const found = walk(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return walk(tree);
  }, [tree, selectedId]);

  const addRootFolder = () => setTree((t) => [...t, createFolder('Group')]);
  const addRootEndpoint = () => setTree((t) => [...t, createEndpoint('Endpoint')]);
  const addFolder = (parentId) => setTree((t) => {
    const next = deepClone(t);
    const found = findNodeAndParent(next, parentId);
    if (found && found.node.type === 'folder') {
      found.node.children.push(createFolder('Group'));
    }
    return next;
  });
  const addEndpoint = (parentId) => setTree((t) => {
    const next = deepClone(t);
    const found = findNodeAndParent(next, parentId);
    if (found && found.node.type === 'folder') {
      found.node.children.push(createEndpoint('Endpoint'));
    }
    return next;
  });
  const deleteNode = (id) => setTree((t) => {
    const next = deepClone(t);
    const info = findNodeAndParent(next, id);
    if (!info) return t;
    info.list.splice(info.index, 1);
    if (selectedId === id) setSelectedId(null);
    return next;
  });
  const renameNode = (id, name) => setTree((t) => {
    const next = deepClone(t);
    const info = findNodeAndParent(next, id);
    if (info) info.node.name = name;
    return next;
  });
  const updateEndpoint = (id, patch) => setTree((t) => {
    const next = deepClone(t);
    const info = findNodeAndParent(next, id);
    if (info && info.node.type === 'endpoint') {
      Object.assign(info.node, patch);
    }
    return next;
  });

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tree, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'api-design.json';
    a.click();
  };

  const onAIGenerate = ({ folder, endpoints }) => {
    setTree((t) => {
      const next = deepClone(t);
      const newFolder = { ...folder, children: endpoints.map((e) => ({ ...createEndpoint(e.name), ...e })) };
      next.push(newFolder);
      return next;
    });
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-600" />
          <div className="font-semibold">API Designer</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs px-3 py-1.5 rounded bg-slate-900 text-white hover:opacity-90" onClick={exportJson}>Export JSON</button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-72 min-w-64 max-w-80">
          <Sidebar
            tree={tree}
            onSelect={setSelectedId}
            selectedId={selectedId}
            onAddRootFolder={addRootFolder}
            onAddRootEndpoint={addRootEndpoint}
            onAddFolder={addFolder}
            onAddEndpoint={addEndpoint}
            onDelete={deleteNode}
            onRename={renameNode}
          />
        </div>
        <div className="flex-1 grid grid-cols-2 min-h-0">
          <div className="border-r border-slate-200 bg-white min-h-0">
            <EndpointEditor
              endpoint={selectedNode?.type === 'endpoint' ? selectedNode : null}
              onChange={(ep) => selectedNode ? updateEndpoint(selectedNode.id, ep) : null}
            />
          </div>
          <div className="grid grid-rows-2 min-h-0">
            <div className="border-b border-slate-200 bg-white min-h-0">
              <MockTester endpoint={selectedNode?.type === 'endpoint' ? selectedNode : null} />
            </div>
            <div className="bg-white min-h-0">
              <AIGenerator onGenerate={onAIGenerate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
