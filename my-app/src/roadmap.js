import React from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

// Danh sách các node (các khối trong roadmap)
const nodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Backend" }, type: "input" },
  { id: "2", position: { x: -200, y: 100 }, data: { label: "Internet" } },
  { id: "3", position: { x: 200, y: 100 }, data: { label: "Pick a Language" } },
  { id: "4", position: { x: -250, y: 200 }, data: { label: "How does the internet work?" } },
  { id: "5", position: { x: -150, y: 200 }, data: { label: "What is HTTP?" } },
  { id: "6", position: { x: 150, y: 200 }, data: { label: "JavaScript" } },
  { id: "7", position: { x: 250, y: 200 }, data: { label: "Python" } },
];

// Danh sách các liên kết giữa node (các đường nối trong roadmap)
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls /> {/* Thêm nút zoom và điều khiển */}
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
