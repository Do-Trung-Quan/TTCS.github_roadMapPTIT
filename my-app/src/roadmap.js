import React from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import "./roadmap.css";
import Header from "./header";

// Danh sách các node (các khối trong roadmap)
const nodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Frontend" }, type: "input" },
  { id: "2", position: { x: -300, y: 150 }, data: { label: "HTML" } },
  { id: "3", position: { x: 0, y: 150 }, data: { label: "CSS" } },
  { id: "4", position: { x: 300, y: 150 }, data: { label: "JavaScript" } },
  { id: "5", position: { x: -300, y: 300 }, data: { label: "Semantic HTML" } },
  { id: "6", position: { x: 0, y: 300 }, data: { label: "Flexbox / Grid" } },
  { id: "7", position: { x: 300, y: 300 }, data: { label: "DOM Manipulation" } },
];


// Danh sách các liên kết giữa node (các đường nối trong roadmap)
const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e1-4", source: "1", target: "4" },
  { id: "e2-5", source: "2", target: "5" },
  { id: "e3-6", source: "3", target: "6" },
  { id: "e4-7", source: "4", target: "7" },
];

export default function Roadmap() {
  return (
    <>
      <Header />
      <div style={{ textAlign: "center", marginTop: "10px" }}>
          <h1>Front-end Roadmap</h1>
          <p>Chào mừng, đây là lộ trình front-end cho các anh chị em</p>
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </>
  );
}
