// Architecture Diagram Page - صفحة المخطط المعماري
// Displays interactive architecture diagram of the project

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
// @ts-ignore - d3 types may not be available
import * as d3 from 'd3';
import Header from '../components/Header/Header';
import { useTheme } from '../contexts/ThemeContext';

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

const PageHeader = styled.div<{ isDark: boolean }>`
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 3px solid ${props => props.isDark ? '#667eea' : '#667eea'};
`;

const Title = styled.h1<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#ffffff' : '#667eea'};
  font-size: 2.5em;
  margin-bottom: 10px;
  text-shadow: ${props => props.isDark ? '0 2px 10px rgba(102, 126, 234, 0.3)' : 'none'};
`;

const Subtitle = styled.p<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#b0b0b0' : '#666'};
  font-size: 1.1em;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark 
    ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: ${props => props.isDark ? '1px solid rgba(102, 126, 234, 0.3)' : 'none'};
  
  h3 {
    font-size: 2em;
    margin-bottom: 5px;
    color: white;
  }
  
  p {
    opacity: 0.9;
    color: white;
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ active?: boolean; isDark?: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  background: ${props => {
    if (props.isDark) {
      return props.active ? '#667eea' : '#4a5568';
    }
    return props.active ? '#764ba2' : '#667eea';
  }};
  color: white;
  border: ${props => props.isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'};
  
  &:hover {
    background: ${props => {
      if (props.isDark) {
        return props.active ? '#5568d3' : '#5a67d8';
      }
      return props.active ? '#653a8f' : '#5568d3';
    }};
    transform: translateY(-2px);
    box-shadow: ${props => props.isDark 
      ? '0 5px 15px rgba(102, 126, 234, 0.5)' 
      : '0 5px 15px rgba(102, 126, 234, 0.4)'};
  }
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
  top: 20px;
  left: 20px;
  width: 350px;
  background: ${props => props.isDark ? '#1e1e2e' : 'white'};
  border-radius: 10px;
  box-shadow: ${props => props.isDark 
    ? '0 10px 30px rgba(0,0,0,0.5)' 
    : '0 10px 30px rgba(0,0,0,0.2)'};
  padding: 20px;
  max-height: 90vh;
  overflow-y: auto;
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1000;
  border: ${props => props.isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'};
  
  h3 {
    color: ${props => props.isDark ? '#ffffff' : '#667eea'};
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid ${props => props.isDark ? '#667eea' : '#667eea'};
  }
  
  .detail {
    margin-bottom: 15px;
    padding: 10px;
    background: ${props => props.isDark ? '#2d3748' : '#f8f9fa'};
    border-radius: 5px;
    color: ${props => props.isDark ? '#e0e0e0' : '#333'};
    
    strong {
      color: ${props => props.isDark ? '#667eea' : '#667eea'};
      display: block;
      margin-bottom: 5px;
    }
  }
`;

const Legend = styled.div<{ isDark: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
  padding: 20px;
  background: ${props => props.isDark ? '#2d3748' : '#f8f9fa'};
  border-radius: 10px;
  border: ${props => props.isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'};
`;

const LegendItem = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.isDark ? '#e0e0e0' : '#333'};
`;

const LegendColor = styled.div<{ color: string; isDark: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 2px solid ${props => props.isDark ? 'rgba(255,255,255,0.3)' : '#333'};
`;

// Architecture Data
const architecture = {
  nodes: [
    {
      id: "core",
      name: "Core",
      type: "core",
      description: "Core functionality and shared utilities",
      details: {
        "Hooks": "23 hooks",
        "Utils": "34 utilities",
        "Types": "20 type definitions",
        "Contexts": "6 contexts",
        "Constants": "Static data",
        "Locales": "Translations (BG/EN)",
        "Features": "Analytics, Reviews, Team, Verification"
      },
      dependencies: [],
      dependents: ["services", "ui", "app", "auth", "cars", "profile", "admin", "social", "messaging", "payments", "iot", "firebase", "functions", "ai-valuation", "external-apis", "storage", "database", "realtime"]
    },
    {
      id: "services",
      name: "Services",
      type: "services",
      description: "Business logic and API services",
      details: {
        "Firebase": "Firestore, Auth, Storage",
        "Car Services": "CRUD, Search, Featured",
        "User Services": "Profile, Auth, Verification",
        "Messaging": "Real-time messaging",
        "Analytics": "Tracking & Analytics",
        "Payment": "Stripe integration",
        "Social": "Social features",
        "Admin": "Admin operations",
        "Total": "216+ service files"
      },
      dependencies: ["core", "firebase", "database", "storage"],
      dependents: ["app", "auth", "cars", "profile", "admin", "social", "messaging", "payments"]
    },
    {
      id: "ui",
      name: "UI Components",
      type: "ui",
      description: "Reusable UI components",
      details: {
        "Components": "388 component files",
        "Layout": "Header, Footer, Layouts",
        "Forms": "Input, Select, DatePicker",
        "Car Components": "CarCard, CarSearch",
        "Profile Components": "Profile, Dealer, Company",
        "Admin Components": "Admin Dashboard",
        "HomePage": "TrustStrip, LiveCounter, etc."
      },
      dependencies: ["core"],
      dependents: ["app", "auth", "cars", "profile", "admin", "social"]
    },
    {
      id: "app",
      name: "App",
      type: "app",
      description: "Main application and routing",
      details: {
        "App.tsx": "Main app component",
        "Routes": "All route definitions",
        "Pages": "Home, About, Contact, Help",
        "Sell Workflow": "Car selling pages",
        "Legal": "Privacy, Terms, Data Deletion"
      },
      dependencies: ["core", "services", "ui", "firebase", "external-apis"],
      dependents: []
    },
    {
      id: "auth",
      name: "Auth",
      type: "auth",
      description: "Authentication pages",
      details: {
        "Login": "Glass morphism login",
        "Register": "Registration flow",
        "Email Verification": "Email verification",
        "OAuth": "Social login callbacks",
        "Admin Login": "Admin authentication"
      },
      dependencies: ["core", "services", "ui", "firebase", "ai-valuation", "external-apis"],
      dependents: []
    },
    {
      id: "cars",
      name: "Cars",
      type: "cars",
      description: "Car-related pages",
      details: {
        "CarsPage": "Car listings",
        "CarDetailsPage": "Car details & edit",
        "AdvancedSearch": "Advanced search",
        "AllCarsPage": "Browse all cars",
        "Hooks": "useCarSearch"
      },
      dependencies: ["core", "services", "ui", "firebase", "storage"],
      dependents: []
    },
    {
      id: "profile",
      name: "Profile",
      type: "profile",
      description: "User profile pages",
      details: {
        "ProfilePage": "Main profile page",
        "Types": "Private, Dealer, Company",
        "Tabs": "Overview, Ads, Campaigns, Analytics, Settings",
        "Consultations": "Expert consultations"
      },
      dependencies: ["core", "services", "ui"],
      dependents: []
    },
    {
      id: "admin",
      name: "Admin",
      type: "admin",
      description: "Admin dashboard and pages",
      details: {
        "AdminPage": "Main admin dashboard",
        "User Management": "User operations",
        "Content Management": "Content moderation",
        "Analytics": "Admin analytics"
      },
      dependencies: ["core", "services", "ui", "firebase", "storage", "realtime"],
      dependents: []
    },
    {
      id: "social",
      name: "Social",
      type: "social",
      description: "Social features",
      details: {
        "SocialFeedPage": "Main feed",
        "AllPostsPage": "Browse posts",
        "CreatePostPage": "Create posts",
        "Events": "Events management"
      },
      dependencies: ["core", "services", "ui", "firebase", "realtime", "functions"],
      dependents: []
    },
    {
      id: "messaging",
      name: "Messaging",
      type: "messaging",
      description: "Messaging system",
      details: {
        "MessagesPage": "Main messages page",
        "Real-time": "WebSocket messaging",
        "Notifications": "Push notifications"
      },
      dependencies: ["core", "services", "ui", "external-apis", "functions"],
      dependents: []
    },
    {
      id: "payments",
      name: "Payments",
      type: "payments",
      description: "Payment and billing",
      details: {
        "BillingPage": "Subscription management",
        "StripeCheckout": "Payment processing",
        "SubscriptionPlans": "Plan selection",
        "BillingService": "Billing operations"
      },
      dependencies: ["core", "services", "ui"],
      dependents: []
    },
    {
      id: "iot",
      name: "IoT",
      type: "iot",
      description: "IoT dashboard",
      details: {
        "IoTDashboardPage": "IoT analytics",
        "Car Tracking": "Vehicle tracking",
        "Real-time Data": "Live data streams"
      },
      dependencies: ["core", "services", "ui"],
      dependents: []
    },
    {
      id: "firebase",
      name: "Firebase",
      type: "backend",
      description: "Firebase backend services",
      details: {
        "Firestore": "NoSQL database",
        "Auth": "Authentication",
        "Storage": "File storage",
        "Functions": "Cloud Functions",
        "Hosting": "Static hosting"
      },
      dependencies: [],
      dependents: ["services", "auth", "cars", "profile", "messaging", "social"]
    },
    {
      id: "functions",
      name: "Cloud Functions",
      type: "backend",
      description: "Firebase Cloud Functions",
      details: {
        "Node.js": "Backend runtime",
        "API Endpoints": "REST APIs",
        "Webhooks": "External integrations",
        "Scheduled": "Cron jobs",
        "Triggers": "Event handlers"
      },
      dependencies: ["firebase"],
      dependents: ["services", "payments", "messaging"]
    },
    {
      id: "ai-valuation",
      name: "AI Valuation",
      type: "ai",
      description: "AI car valuation model",
      details: {
        "Python": "XGBoost model",
        "Vertex AI": "Google AI platform",
        "ML Pipeline": "Training & inference",
        "Price Prediction": "Car value estimation"
      },
      dependencies: [],
      dependents: ["services", "cars"]
    },
    {
      id: "external-apis",
      name: "External APIs",
      type: "external",
      description: "Third-party integrations",
      details: {
        "Stripe": "Payment processing",
        "Google Maps": "Location services",
        "Algolia": "Search engine",
        "Facebook": "Social login",
        "Google OAuth": "Authentication",
        "SMS/Email": "Notifications"
      },
      dependencies: [],
      dependents: ["services", "auth", "payments", "cars"]
    },
    {
      id: "storage",
      name: "Storage",
      type: "backend",
      description: "File storage system",
      details: {
        "Firebase Storage": "Image uploads",
        "CDN": "Content delivery",
        "Optimization": "Image compression",
        "Caching": "Asset caching"
      },
      dependencies: ["firebase"],
      dependents: ["services", "cars", "profile", "social"]
    },
    {
      id: "database",
      name: "Database",
      type: "backend",
      description: "Data persistence layer",
      details: {
        "Firestore": "NoSQL database",
        "Collections": "Users, Cars, Messages",
        "Indexes": "Query optimization",
        "Security Rules": "Access control"
      },
      dependencies: ["firebase"],
      dependents: ["services"]
    },
    {
      id: "realtime",
      name: "Real-time",
      type: "backend",
      description: "Real-time communication",
      details: {
        "WebSocket": "Live connections",
        "Firestore Listeners": "Real-time updates",
        "Presence": "User status",
        "Notifications": "Push notifications"
      },
      dependencies: ["firebase", "database"],
      dependents: ["messaging", "social", "cars"]
    }
  ]
};

const ArchitectureDiagramPage: React.FC = () => {
  const { isDark } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [viewType, setViewType] = useState<string>('all');

  useEffect(() => {
    if (!svgRef.current) return;

    console.log('🎨 Rendering diagram with CIRCLES (not rectangles)');
    
    const width = svgRef.current?.clientWidth || 1600;
    const height = svgRef.current?.clientHeight || 800;
    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();

    // Create defs element for gradients, filters, and markers
    const defs = svg.append("defs");

    // Add arrow marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 6)
      .attr("refY", 3)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0,0 L 0,6 L 9,3 z")
      .attr("fill", isDark ? "#667eea" : "#999");

    // Filter nodes based on view type
    let filteredNodes = architecture.nodes;
    if (viewType === "core") {
      filteredNodes = architecture.nodes.filter(n => ["core", "services", "ui"].includes(n.id));
    } else if (viewType === "features") {
      filteredNodes = architecture.nodes.filter(n => ["profile", "admin", "social", "messaging", "payments", "iot"].includes(n.id));
    } else if (viewType === "dependencies") {
      filteredNodes = architecture.nodes.filter(n => n.dependencies.length > 0);
    }

    // Create links
    const links: any[] = [];
    filteredNodes.forEach(node => {
      node.dependencies.forEach(dep => {
        if (filteredNodes.find(n => n.id === dep)) {
          links.push({ source: dep, target: node.id });
        }
      });
    });

    // Create force simulation with n8n-style spacing
    const simulation = (d3 as any).forceSimulation(filteredNodes)
      .force("link", (d3 as any).forceLink(links).id((d: any) => d.id).distance(200))
      .force("charge", (d3 as any).forceManyBody().strength(-600))
      .force("center", (d3 as any).forceCenter(width / 2, height / 2))
      .force("collision", (d3 as any).forceCollide().radius(80));

    // Create n8n-style curved links
    const link = svg.append("g")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .attr("d", (d: any) => {
        const dx = (d.target.x - d.source.x);
        const dy = (d.target.y - d.source.y);
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

    // n8n-style color mapping
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
      core: { bg: "#ff6b6b", border: "#ff5252", text: "#ffffff" },
      services: { bg: "#4ecdc4", border: "#26a69a", text: "#ffffff" },
      ui: { bg: "#ffd93d", border: "#f9ca24", text: "#2c3e50" },
      app: { bg: "#6c5ce7", border: "#5f3dc4", text: "#ffffff" },
      auth: { bg: "#00b894", border: "#00a085", text: "#ffffff" },
      cars: { bg: "#fd79a8", border: "#e84393", text: "#ffffff" },
      profile: { bg: "#fdcb6e", border: "#e17055", text: "#2c3e50" },
      admin: { bg: "#74b9ff", border: "#0984e3", text: "#ffffff" },
      social: { bg: "#a29bfe", border: "#6c5ce7", text: "#ffffff" },
      messaging: { bg: "#55efc4", border: "#00b894", text: "#2c3e50" },
      payments: { bg: "#ffeaa7", border: "#fdcb6e", text: "#2c3e50" },
      iot: { bg: "#81ecec", border: "#00cec9", text: "#2c3e50" },
      backend: { bg: isDark ? "#2d3436" : "#636e72", border: isDark ? "#1a1a1a" : "#2d3436", text: "#ffffff" },
      ai: { bg: "#e17055", border: "#d63031", text: "#ffffff" },
      external: { bg: "#00b894", border: "#00a085", text: "#ffffff" }
    };

    // Create shadow filter for n8n-style nodes
    const shadowFilter = defs.append("filter")
      .attr("id", "node-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    shadowFilter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    
    shadowFilter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("result", "offsetBlur");
    
    const feComponentTransfer = shadowFilter.append("feComponentTransfer")
      .attr("in", "offsetBlur");
    feComponentTransfer.append("feFuncA")
      .attr("type", "linear")
      .attr("slope", 0.3);
    
    const feMerge = shadowFilter.append("feMerge");
    feMerge.append("feMergeNode");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    // Create nodes as n8n-style rectangles
    console.log(`📊 Creating ${filteredNodes.length} nodes as n8n-style RECTANGLES`);
    
    // Node dimensions
    const nodeWidth = 140;
    const nodeHeight = 60;
    const nodeRadius = 8;
    
    const node = svg.append("g")
      .selectAll("g")
      .data(filteredNodes)
      .enter().append("g")
      .attr("class", (d: any) => `node ${d.type}`)
      .call(drag(simulation) as any)
      .on("click", (event, d: any) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .on("mouseover", function(event, d: any) {
        const nodeGroup = d3.select(this);
        nodeGroup.select("rect")
          .transition()
          .duration(200)
          .attr("filter", "url(#node-glow)")
          .attr("transform", "scale(1.05)");
        nodeGroup.select("text")
          .transition()
          .duration(200)
          .attr("font-weight", "800");
      })
      .on("mouseout", function(event, d: any) {
        const nodeGroup = d3.select(this);
        nodeGroup.select("rect")
          .transition()
          .duration(200)
          .attr("filter", "url(#node-shadow)")
          .attr("transform", "scale(1)");
        nodeGroup.select("text")
          .transition()
          .duration(200)
          .attr("font-weight", "600");
      })
      .style("cursor", "pointer");

    // Add glow filter for hover effect
    const glowFilter = defs.append("filter")
      .attr("id", "node-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", 4)
      .attr("result", "coloredBlur");
    
    const glowMerge = glowFilter.append("feMerge");
    glowMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    glowMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    // Create n8n-style rectangle node
    node.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", nodeRadius)
      .attr("ry", nodeRadius)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .attr("fill", (d: any) => {
        const colors = colorMap[d.type] || colorMap.core;
        return colors.bg;
      })
      .attr("stroke", (d: any) => {
        const colors = colorMap[d.type] || colorMap.core;
        return colors.border;
      })
      .attr("stroke-width", 2)
      .attr("filter", "url(#node-shadow)")
      .attr("opacity", 0.95);

    // Add text label
    node.append("text")
      .text((d: any) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")
      .attr("fill", (d: any) => {
        const colors = colorMap[d.type] || colorMap.core;
        return colors.text;
      })
      .attr("pointer-events", "none");

    // Update positions
    simulation.on("tick", () => {
      link.attr("d", (d: any) => {
        const dx = (d.target.x - d.source.x);
        const dy = (d.target.y - d.source.y);
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr("transform", (d: any) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Drag function
    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return (d3 as any).drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [viewType, isDark]);

  const showView = (type: string) => {
    setViewType(type);
  };

  const resetView = () => {
    setViewType('all');
    setSelectedNode(null);
  };

  return (
    <>
      <Header />
      <Container isDark={isDark}>
        <Content isDark={isDark}>
          <DiagramContainer isDark={isDark}>
            <svg ref={svgRef} width="100%" height="100%" />
          </DiagramContainer>

          <Legend isDark={isDark}>
            <LegendItem isDark={isDark}>
              <LegendColor color="#ff6b6b" isDark={isDark} />
              <span>Core</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#4ecdc4" isDark={isDark} />
              <span>Services</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#ffe66d" isDark={isDark} />
              <span>UI</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#95e1d3" isDark={isDark} />
              <span>App</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#a8e6cf" isDark={isDark} />
              <span>Auth</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#ffd3a5" isDark={isDark} />
              <span>Cars</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#fd79a8" isDark={isDark} />
              <span>Profile</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#fdcb6e" isDark={isDark} />
              <span>Admin</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#74b9ff" isDark={isDark} />
              <span>Social</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#a29bfe" isDark={isDark} />
              <span>Messaging</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#55efc4" isDark={isDark} />
              <span>Payments & IoT</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#2d3436" isDark={isDark} />
              <span>Backend Services</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#e17055" isDark={isDark} />
              <span>AI Services</span>
            </LegendItem>
            <LegendItem isDark={isDark}>
              <LegendColor color="#00b894" isDark={isDark} />
              <span>External APIs</span>
            </LegendItem>
          </Legend>

          {selectedNode && (
            <InfoPanel show={!!selectedNode} isDark={isDark} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedNode.name} Package</h3>
            <div className="detail">
              <strong>Description:</strong>
              <p>{selectedNode.description}</p>
            </div>
            <div className="detail">
              <strong>Details:</strong>
              {Object.entries(selectedNode.details).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value as string}</p>
              ))}
            </div>
            <div className="detail">
              <strong>Dependencies:</strong>
              <p>{selectedNode.dependencies.length > 0 ? selectedNode.dependencies.join(", ") : "None"}</p>
            </div>
            <div className="detail">
              <strong>Used By:</strong>
              <p>{selectedNode.dependents.length > 0 ? selectedNode.dependents.join(", ") : "None"}</p>
            </div>
            <Button isDark={isDark} onClick={() => setSelectedNode(null)} style={{ marginTop: '10px', width: '100%' }}>
              إغلاق | Close
            </Button>
          </InfoPanel>
        )}
        </Content>
      </Container>
    </>
  );
};

export default ArchitectureDiagramPage;
