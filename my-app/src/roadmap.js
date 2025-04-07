import React from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import "./roadmap.css"; // <-- Import CSS tại đây

const nodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Backend" }, type: "input" },

  // Nhóm Internet
  { id: "2", position: { x: -300, y: 150 }, data: { label: "Internet" } },
  { id: "4", position: { x: -400, y: 300 }, data: { label: "How does the internet work?" } },
  { id: "5", position: { x: -200, y: 300 }, data: { label: "What is HTTP?" } },

  // Nhóm Language
  { id: "3", position: { x: 300, y: 150 }, data: { label: "Pick a Language" } },
  { id: "6", position: { x: 200, y: 300 }, data: { label: "JavaScript" } },
  { id: "7", position: { x: 400, y: 300 }, data: { label: "Python" } },
];


const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e2-5", source: "2", target: "5" },
  { id: "e3-6", source: "3", target: "6" },
  { id: "e3-7", source: "3", target: "7" },
];

export default function Roadmap() {
  return (
    <div className="roadmap-container"> {/* Đây là dòng bạn cần thêm className */}
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls />
        <Background color="#e0e0e0" gap={16} />
      </ReactFlow>
    </div>
  );
}
