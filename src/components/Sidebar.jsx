import React from 'react';
import { Folder, File, Plus, Trash } from 'lucide-react';

function TreeNode({ node, depth, onSelect, selectedId, onAddFolder, onAddEndpoint, onDelete, onRename }) {
  const padding = 8 + depth * 12;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 ${isSelected ? 'bg-slate-100' : ''}`}
        style={{ paddingLeft: padding }}
        onClick={() => onSelect(node.id)}
      >
        {node.type === 'folder' ? (
          <Folder className="w-4 h-4 text-slate-600" />
        ) : (
          <File className="w-4 h-4 text-slate-600" />
        )}
        <input
          className="bg-transparent outline-none flex-1 text-sm"
          value={node.name}
          onChange={(e) => onRename(node.id, e.target.value)}
        />
        {node.type === 'folder' && (
          <>
            <button
              className="p-1 hover:bg-slate-200 rounded"
              title="Add folder"
              onClick={(e) => { e.stopPropagation(); onAddFolder(node.id); }}
            >
              <Folder className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-slate-200 rounded"
              title="Add endpoint"
              onClick={(e) => { e.stopPropagation(); onAddEndpoint(node.id); }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </>
        )}
        <button
          className="p-1 hover:bg-red-100 rounded"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
        >
          <Trash className="w-3 h-3 text-red-500" />
        </button>
      </div>
      {node.type === 'folder' && node.children?.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          onSelect={onSelect}
          selectedId={selectedId}
          onAddFolder={onAddFolder}
          onAddEndpoint={onAddEndpoint}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}

export default function Sidebar({ tree, onSelect, selectedId, onAddRootFolder, onAddRootEndpoint, onAddFolder, onAddEndpoint, onDelete, onRename }) {
  return (
    <div className="h-full flex flex-col border-r border-slate-200 bg-white">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="font-semibold">Routes</div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-900 text-white hover:opacity-90" onClick={onAddRootFolder}>
            <Folder className="w-3 h-3" /> Folder
          </button>
          <button className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:opacity-90" onClick={onAddRootEndpoint}>
            <Plus className="w-3 h-3" /> Endpoint
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {tree.length === 0 ? (
          <div className="text-xs text-slate-500 p-3">Get started by adding a folder or an endpoint.</div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              onSelect={onSelect}
              selectedId={selectedId}
              onAddFolder={onAddFolder}
              onAddEndpoint={onAddEndpoint}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))
        )}
      </div>
    </div>
  );
}
