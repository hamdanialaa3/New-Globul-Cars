// Architecture Diagram Page - صفحة المخطط المعماري
// Displays interactive architecture diagram of the project

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import Header from '../components/Header/UnifiedHeader';
import { useTheme } from '../contexts/ThemeContext';

interface ArchitectureNode {
  id: string;
  name: string;
  type: string;
  column: number;
  row: number;
  description: string;
  details: Record<string, string>;
  path: string | null;
  dependencies: string[];
  x?: number;
  y?: number;
}

interface ArchitectureLink {
  source: ArchitectureNode | string;
  target: ArchitectureNode | string;
}

const Container = styled.div<{ isDark: boolean }>`
  width: 100%;
  min-height: 100vh;
  background: ${props => props.isDark
    ? '#1a1d29'
    : '#f5f5f5'};
  padding: 0;
  padding-top: 80px;
  direction: rtl;
  overflow: hidden;
`;

const Content = styled.div<{ isDark: boolean }>`
  width: 100%;
  height: calc(100vh - 80px);
  margin: 0;
  background: ${props => props.isDark ? '#1a1d29' : '#f5f5f5'};
  padding: 0;
  border: none;
  position: relative;
`;

const DiagramContainer = styled.div<{ isDark: boolean }>`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  background: ${props => props.isDark ? '#1a1d29' : '#f5f5f5'};
  overflow: hidden;
  position: relative;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const InfoPanel = styled.div<{ show: boolean; isDark: boolean }>`
  position: fixed;
  top: 100px;
  left: 20px;
  width: 350px;
  background: ${props => props.isDark ? 'rgba(30, 30, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: ${props => props.isDark
    ? '0 10px 30px rgba(0,0,0,0.5)'
    : '0 10px 30px rgba(0,0,0,0.2)'};
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1000;
  border: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  transition: all 0.3s ease;
  
  h3 {
    color: ${props => props.isDark ? '#ffffff' : '#1a1d29'};
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    font-size: 1.5rem;
  }
  
  .description {
    color: ${props => props.isDark ? '#b0b0b0' : '#666'};
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  .detail-group {
    margin-top: 15px;
  }
  
  .detail-title {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${props => props.isDark ? '#667eea' : '#667eea'};
    margin-bottom: 10px;
    font-weight: 600;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    color: ${props => props.isDark ? '#e0e0e0' : '#333'};
    font-size: 0.95rem;
    
    &:last-child {
      border-bottom: none;
    }
    
    span:first-child {
      font-weight: 500;
    }
    
    span:last-child {
      opacity: 0.8;
    }
  }

  .action-btn {
    margin-top: 20px;
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const Legend = styled.div<{ isDark: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: ${props => props.isDark ? 'rgba(45, 55, 72, 0.9)' : 'rgba(248, 249, 250, 0.9)'};
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 100;
`;

const LegendItem = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.isDark ? '#e0e0e0' : '#333'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const LegendColor = styled.div<{ color: string; isDark: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${props => props.color};
  box-shadow: ${props => props.isDark ? '0 2px 4px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.2)'};
  border: 1px solid ${props => props.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
`;

// Architecture Data with Layout Info
const architecture = {
  nodes: [
    // Column 1: Infrastructure & Data
    {
      id: "firebase",
      name: "Firebase Core",
      type: "backend",
      column: 0,
      row: 0,
      description: "Backend Infrastructure",
      details: { "Services": "Auth, Firestore, Storage", "Region": "europe-west1" },
      path: null,
      dependencies: []
    },
    {
      id: "database",
      name: "Firestore DB",
      type: "backend",
      column: 0,
      row: 1,
      description: "NoSQL Database",
      details: { "Collections": "Users, Cars, Messages", "Indexes": "Optimized" },
      path: null,
      dependencies: ["firebase"]
    },
    {
      id: "storage",
      name: "Cloud Storage",
      type: "backend",
      column: 0,
      row: 2,
      description: "Asset Storage",
      details: { "Buckets": "Images, Documents", "CDN": "Global Edge" },
      path: null,
      dependencies: ["firebase"]
    },
    {
      id: "functions",
      name: "Cloud Functions",
      type: "backend",
      column: 0,
      row: 3,
      description: "Serverless Logic",
      details: { "Runtime": "Node.js 18", "Triggers": "HTTP, Firestore" },
      path: null,
      dependencies: ["firebase", "ai-valuation"]
    },
    {
      id: "ai-valuation",
      name: "AI Engine",
      type: "ai",
      column: 0,
      row: 4,
      description: "Price Prediction Model",
      details: { "Model": "XGBoost", "Platform": "Vertex AI" },
      path: null,
      dependencies: ["database", "storage"]
    },
    {
      id: "external-apis",
      name: "External APIs",
      type: "external",
      column: 0,
      row: 5,
      description: "Third-party Services",
      details: { "Stripe": "Payments", "Google Maps": "Location" },
      path: null,
      dependencies: []
    },
    {
      id: "mobilebg",
      name: "MobileBG.eu",
      type: "external-data",
      column: 0,
      row: 6,
      description: "External Car Data Source",
      details: { "Domain": "mobilebg.eu", "Type": "Web Scraping", "Data": "Car Listings" },
      path: null,
      dependencies: []
    },

    // Column 2: Core & Base
    {
      id: "core",
      name: "Core System",
      type: "core",
      column: 1,
      row: 2,
      description: "Foundation Layer",
      details: { "Hooks": "23+", "Contexts": "Auth, Theme" },
      path: null,
      dependencies: []
    },

    // Column 3: Services
    {
      id: "services",
      name: "Service Layer",
      type: "services",
      column: 2,
      row: 2,
      description: "Business Logic",
      details: { "Modules": "Auth, Car, User", "API": "Internal" },
      path: null,
      dependencies: ["core", "firebase", "database", "storage", "functions", "ai-valuation", "external-apis", "mobilebg"]
    },

    // Column 4: UI Components
    {
      id: "ui",
      name: "UI Library",
      type: "ui",
      column: 3,
      row: 2,
      description: "Design System",
      details: { "Components": "380+", "Theme": "Styled Components" },
      path: "/icon-showcase",
      dependencies: ["core"]
    },

    // Column 5: Features (The "Meat" of the app)
    {
      id: "auth",
      name: "Authentication",
      type: "auth",
      column: 4,
      row: 0,
      description: "Identity Management",
      details: { "Pages": "Login, Register", "Security": "OAuth 2.0" },
      path: "/login",
      dependencies: ["services", "ui"]
    },
    {
      id: "cars",
      name: "Car Marketplace",
      type: "cars",
      column: 4,
      row: 1,
      description: "Vehicle Listings",
      details: { "Features": "Search, Filter, Details", "Route": "/cars" },
      path: "/cars",
      dependencies: ["services", "ui"]
    },
    {
      id: "profile",
      name: "User Profiles",
      type: "profile",
      column: 4,
      row: 2,
      description: "User Management",
      details: { "Types": "Private, Dealer", "Route": "/profile" },
      path: "/profile",
      dependencies: ["services", "ui"]
    },
    {
      id: "social",
      name: "Social Network",
      type: "social",
      column: 4,
      row: 3,
      description: "Community Features",
      details: { "Features": "Feed, Posts, Events", "Route": "/social" },
      path: "/social",
      dependencies: ["services", "ui"]
    },
    {
      id: "messaging",
      name: "Messaging",
      type: "messaging",
      column: 4,
      row: 4,
      description: "Chat System",
      details: { "Tech": "WebSocket", "Route": "/messages" },
      path: "/messages",
      dependencies: ["services", "ui"]
    },
    {
      id: "payments",
      name: "Billing & Pay",
      type: "payments",
      column: 4,
      row: 5,
      description: "Financial System",
      details: { "Provider": "Stripe", "Route": "/billing" },
      path: "/billing",
      dependencies: ["services", "ui"]
    },
    {
      id: "iot",
      name: "IoT Hub",
      type: "iot",
      column: 4,
      row: 6,
      description: "Device Connectivity",
      details: { "Data": "Telemetry", "Route": "/iot-dashboard" },
      path: "/iot-dashboard",
      dependencies: ["services", "ui"]
    },
    {
      id: "admin",
      name: "Admin Portal",
      type: "admin",
      column: 4,
      row: 7,
      description: "System Administration",
      details: { "Access": "RBAC", "Route": "/admin" },
      path: "/admin",
      dependencies: ["services", "ui"]
    },
    {
      id: "super-admin",
      name: "Super Admin",
      type: "super-admin",
      column: 4,
      row: 8,
      description: "Master Control Panel",
      details: { "Access": "Owner Only", "Route": "/super-admin", "Features": "Full System Control" },
      path: "/super-admin",
      dependencies: ["services", "ui", "firebase", "database", "storage", "functions", "ai-valuation", "external-apis", "mobilebg"]
    },

    // Column 6: App Orchestrator
    {
      id: "app",
      name: "App Root",
      type: "app",
      column: 5,
      row: 3, // Centered vertically relative to features
      description: "Application Shell",
      details: { "Router": "React Router", "Layout": "Main" },
      path: "/",
      dependencies: ["auth", "cars", "profile", "social", "messaging", "payments", "iot", "admin", "super-admin"]
    }
  ]
};

const ArchitectureDiagramPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 1600;
    const height = svgRef.current.clientHeight || 900;
    const svg = d3.select(svgRef.current);

    // Clear previous
    svg.selectAll("*").remove();

    // Definitions
    const defs = svg.append("defs");

    // Gradients
    const gradients = [
      { id: "grad-core", colors: ["#ff6b6b", "#ee5253"] },
      { id: "grad-services", colors: ["#4ecdc4", "#22a6b3"] },
      { id: "grad-ui", colors: ["#feca57", "#ff9f43"] },
      { id: "grad-app", colors: ["#5f27cd", "#341f97"] },
      { id: "grad-feature", colors: ["#54a0ff", "#2e86de"] },
      { id: "grad-backend", colors: ["#576574", "#222f3e"] },
      { id: "grad-ai", colors: ["#ff9ff3", "#f368e0"] },
      { id: "grad-super-admin", colors: ["#ffd700", "#ffed4e"] },
      { id: "grad-external-data", colors: ["#ff6348", "#ff4757"] },
    ];

    gradients.forEach(g => {
      const grad = defs.append("linearGradient")
        .attr("id", g.id)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").style("stop-color", g.colors[0]);
      grad.append("stop").attr("offset", "100%").style("stop-color", g.colors[1]);
    });

    // Glow Filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Layout Calculation
    const columns = 6;
    const colWidth = width / columns;
    const nodes = architecture.nodes.map(node => {
      // Calculate Y based on row index and total rows in that column
      // To center them, we need to know max rows in this column or just use fixed spacing
      // Let's use fixed spacing for now, centered vertically
      const nodesInCol = architecture.nodes.filter(n => n.column === node.column).length;
      const rowHeight = height / (nodesInCol + 1);

      // Re-calculate row index to be sequential for this column to center properly
      const sortedColNodes = architecture.nodes
        .filter(n => n.column === node.column)
        .sort((a, b) => a.row - b.row);
      const relativeRow = sortedColNodes.findIndex(n => n.id === node.id);

      return {
        ...node,
        x: (node.column * colWidth) + (colWidth / 2),
        y: (relativeRow + 1) * (height / (nodesInCol + 1))
      };
    });

    // Links
    const links: ArchitectureLink[] = [];
    nodes.forEach(node => {
      node.dependencies.forEach(depId => {
        const target = nodes.find(n => n.id === depId);
        if (target) {
          // Dependency means Node depends on Target. 
          // Flow usually goes from Dependency -> Node (Data flows from DB to Service)
          // So Source = Target (Provider), Target = Node (Consumer)
          links.push({ source: target, target: node });
        }
      });
    });

    // Draw Links
    const linkGroup = svg.append("g").attr("class", "links");

    linkGroup.selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("d", (d: ArchitectureLink) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        // Curvy lines
        return `M${source.x},${source.y}C${source.x + dx / 2},${source.y} ${target.x - dx / 2},${target.y} ${target.x},${target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)")
      .attr("stroke-width", 2)
      .attr("opacity", isDark ? 0.6 : 0.4);

    // Animated Flow Particles
    const particleGroup = svg.append("g").attr("class", "particles");

    // Color map for flows
    const flowColors: { [key: string]: string } = {
      core: "#ff6b6b",
      services: "#4ecdc4",
      ui: "#feca57",
      app: "#5f27cd",
      auth: "#00b894",
      cars: "#54a0ff",
      profile: "#fdcb6e",
      social: "#a29bfe",
      messaging: "#55efc4",
      payments: "#ffeaa7",
      iot: "#81ecec",
      backend: "#576574",
      ai: "#ff9ff3",
      external: "#00d2d3",
      "external-data": "#ff6348",
      "super-admin": "#ffd700",
      admin: "#74b9ff"
    };

    links.forEach((link, i) => {
      const path = linkGroup.select(`path:nth-child(${i + 1})`).node() as SVGPathElement;
      if (!path) return;

      const l = path.getTotalLength();
      const sourceColor = flowColors[link.source.type] || (isDark ? "#667eea" : "#764ba2");
      const targetColor = flowColors[link.target.type] || (isDark ? "#667eea" : "#764ba2");

      // 1. Forward Flow Particle (Source -> Target)
      const particleForward = particleGroup.append("circle")
        .attr("r", 4)
        .attr("fill", sourceColor)
        .attr("filter", "url(#glow)");

      function animateForward() {
        particleForward.transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeLinear)
          .attrTween("transform", function () {
            return function (t) {
              const p = path.getPointAtLength(t * l);
              return `translate(${p.x},${p.y})`;
            };
          })
          .attrTween("r", function () {
            return function (t) {
              // Pulse effect: grow and shrink
              return 3 + Math.sin(t * Math.PI * 2) * 1.5;
            };
          })
          .on("end", animateForward);
      }
      animateForward();

      // 2. Return Flow Particle (Target -> Source) - "The Return Flash"
      const particleBackward = particleGroup.append("circle")
        .attr("r", 3)
        .attr("fill", targetColor)
        .attr("opacity", 0.6)
        .attr("filter", "url(#glow)");

      function animateBackward() {
        particleBackward.transition()
          .delay(1000) // Offset start time
          .duration(2500 + Math.random() * 1000)
          .ease(d3.easeLinear)
          .attrTween("transform", function () {
            return function (t) {
              // Move backwards (1 - t)
              const p = path.getPointAtLength((1 - t) * l);
              return `translate(${p.x},${p.y})`;
            };
          })
          .on("end", animateBackward);
      }
      animateBackward();
    });

    const nodeGroup = svg.append("g").attr("class", "nodes");

    // Node Rects Dimensions
    const nodeWidth = 160;
    const nodeHeight = 70;

    const node = nodeGroup.selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("transform", (d: ArchitectureNode) => `translate(${(d.x || 0) - nodeWidth / 2},${(d.y || 0) - nodeHeight / 2})`)
      .style("cursor", "pointer")
      .on("click", (e, d) => {
        e.stopPropagation();
        setSelectedNode(d);
      })
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("transform", (d: ArchitectureNode) => `translate(${(d.x || 0) - nodeWidth / 2},${(d.y || 0) - nodeHeight / 2}) scale(1.05)`);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("transform", (d: ArchitectureNode) => `translate(${(d.x || 0) - nodeWidth / 2},${(d.y || 0) - nodeHeight / 2}) scale(1)`);
      });

    // Node Rects

    node.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 12)
      .attr("ry", 12)
      .attr("fill", (d: ArchitectureNode) => {
        if (d.type === 'core') return "url(#grad-core)";
        if (d.type === 'services') return "url(#grad-services)";
        if (d.type === 'ui') return "url(#grad-ui)";
        if (d.type === 'app') return "url(#grad-app)";
        if (d.type === 'backend' || d.type === 'external') return "url(#grad-backend)";
        if (d.type === 'ai') return "url(#grad-ai)";
        if (d.type === 'external-data') return "url(#grad-external-data)";
        if (d.type === 'super-admin') return "url(#grad-super-admin)";
        if (d.type === 'admin') return "#74b9ff";
        return "url(#grad-feature)";
      })
      .attr("stroke", isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)")
      .attr("stroke-width", 1)
      .attr("filter", "url(#glow)")
      .style("opacity", 0.9);

    // Node Icons/Text
    node.append("text")
      .text((d: ArchitectureNode) => d.name)
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 2)
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.3)");

    // Node Type Label (Small)
    node.append("text")
      .text((d: ArchitectureNode) => d.type.toUpperCase())
      .attr("x", nodeWidth / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", "9px")
      .attr("letter-spacing", "1px")
      .style("pointer-events", "none");

  }, [isDark]);

  return (
    <>
      <Header />
      <Container isDark={isDark} onClick={() => setSelectedNode(null)}>
        <Content isDark={isDark}>
          <DiagramContainer isDark={isDark}>
            <svg ref={svgRef} width="100%" height="100%" />
          </DiagramContainer>

          <InfoPanel show={!!selectedNode} isDark={isDark} onClick={(e) => e.stopPropagation()}>
            {selectedNode && (
              <>
                <h3>{selectedNode.name}</h3>
                <p className="description">{selectedNode.description}</p>

                <div className="detail-group">
                  <div className="detail-title">Details</div>
                  {Object.entries(selectedNode.details).map(([key, value]: [string, string]) => (
                    <div key={key} className="detail-item">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>

                {selectedNode.path && (
                  <button
                    className="action-btn"
                    onClick={() => navigate(selectedNode.path)}
                  >
                    Go to {selectedNode.name}
                  </button>
                )}
              </>
            )}
          </InfoPanel>

          <Legend isDark={isDark}>
            <LegendItem isDark={isDark}>
              <LegendColor color="#576574" isDark={isDark} />
              <span>Infrastructure</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#ff6b6b" isDark={isDark} />
              <span>Core</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#4ecdc4" isDark={isDark} />
              <span>Services</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#feca57" isDark={isDark} />
              <span>UI Components</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#54a0ff" isDark={isDark} />
              <span>Features</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#5f27cd" isDark={isDark} />
              <span>App Root</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#ffd700" isDark={isDark} />
              <span>Super Admin</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#ff6348" isDark={isDark} />
              <span>External Data</span>
            </LegendItem>
          </Legend>
        </Content>
      </Container>
    </>
  );
};

export default ArchitectureDiagramPage;
