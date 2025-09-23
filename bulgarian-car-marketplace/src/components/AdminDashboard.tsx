// src/components/AdminDashboard.tsx
// Admin Dashboard Component for Bulgarian Car Marketplace

import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";

// Main Component
const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalCars: 0,
    activeListings: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalCars: 1250,
        activeListings: 890,
        totalUsers: 3450,
        totalRevenue: 125000
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1>{t("admin.dashboard.title", "Admin Dashboard")}</h1>
        <p>{t("admin.dashboard.subtitle", "Manage your Bulgarian car marketplace")}</p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
            {t("admin.stats.totalCars", "Total Cars")}
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#1976d2" }}>
            {stats.totalCars.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
            {t("admin.stats.activeListings", "Active Listings")}
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#1976d2" }}>
            {stats.activeListings.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
            {t("admin.stats.totalUsers", "Total Users")}
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#1976d2" }}>
            {stats.totalUsers.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#666" }}>
            {t("admin.stats.revenue", "Revenue (€)")}
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#1976d2" }}>
            {stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2rem"
      }}>
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ margin: "0 0 1rem 0" }}>
            {t("admin.recentActivity", "Recent Activity")}
          </h2>
          <p>Recent activity will be displayed here...</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ margin: "0 0 1rem 0" }}>
              {t("admin.quickActions", "Quick Actions")}
            </h2>
            <button style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              {t("admin.addNewCar", "Add New Car")}
            </button>
            <button style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
              {t("admin.manageUsers", "Manage Users")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
