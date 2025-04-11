import React from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import './roadmap.css';
import Header from '../../components/Header/header';

// Danh sách các node (các khối trong roadmap)
const nodes = [
  // Root
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Frontend" }, type: "input" },

  // HTML branch
  { id: "2", position: { x: -500, y: 150 }, data: { label: "HTML" } },
  { id: "5", position: { x: -650, y: 300 }, data: { label: "Semantic HTML" } },
  { id: "8", position: { x: -500, y: 300 }, data: { label: "Forms & Validation" } },
  { id: "9", position: { x: -350, y: 300 }, data: { label: "Accessibility (a11y)" } },

  // CSS branch
  { id: "3", position: { x: 0, y: 150 }, data: { label: "CSS" } },
  { id: "6", position: { x: -150, y: 300 }, data: { label: "Flexbox / Grid" } },
  { id: "10", position: { x: 0, y: 300 }, data: { label: "Responsive Design" } },
  { id: "11", position: { x: 150, y: 300 }, data: { label: "Animations / Transitions" } },
  { id: "12", position: { x: 0, y: 450 }, data: { label: "SCSS / Sass / CSS Modules" } },

  // JavaScript branch
  { id: "4", position: { x: 500, y: 150 }, data: { label: "JavaScript" } },
  { id: "7", position: { x: 350, y: 300 }, data: { label: "DOM Manipulation" } },
  { id: "13", position: { x: 500, y: 300 }, data: { label: "ES6+ Features" } },
  { id: "14", position: { x: 650, y: 300 }, data: { label: "Events / Event Delegation" } },
  { id: "15", position: { x: 500, y: 450 }, data: { label: "Async JS (Promises, async/await)" } },
  { id: "16", position: { x: 650, y: 450 }, data: { label: "Fetch API / Axios" } },
  { id: "17", position: { x: 350, y: 450 }, data: { label: "LocalStorage / SessionStorage" } },


];




// Danh sách các liên kết giữa node (các đường nối trong roadmap)
const edges = [
  // Gốc → 3 mảng chính
  { id: "e1-2", source: "1", target: "2" }, // Frontend → HTML
  { id: "e1-3", source: "1", target: "3" }, // Frontend → CSS
  { id: "e1-4", source: "1", target: "4" }, // Frontend → JavaScript

  // HTML
  { id: "e2-5", source: "2", target: "5" }, // HTML → Semantic HTML
  { id: "e2-8", source: "2", target: "8" }, // HTML → Forms & Validation
  { id: "e2-9", source: "2", target: "9" }, // HTML → Accessibility

  // CSS
  { id: "e3-6", source: "3", target: "6" }, // CSS → Flexbox / Grid
  { id: "e3-10", source: "3", target: "10" }, // CSS → Responsive Design
  { id: "e3-11", source: "3", target: "11" }, // CSS → Animations
  { id: "e3-12", source: "3", target: "12" }, // CSS → SCSS / Modules

  // JavaScript
  { id: "e4-7", source: "4", target: "7" }, // JS → DOM Manipulation
  { id: "e4-13", source: "4", target: "13" }, // JS → ES6+
  { id: "e4-14", source: "4", target: "14" }, // JS → Events
  { id: "e4-15", source: "4", target: "15" }, // JS → Async
  { id: "e4-16", source: "4", target: "16" }, // JS → Fetch/Axios
  { id: "e4-17", source: "4", target: "17" }, // JS → LocalStorage

  // Đưa đến Frameworks
  { id: "e3-18", source: "3", target: "18" }, // CSS → Frameworks
  { id: "e4-18", source: "4", target: "18" }, // JS → Frameworks
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