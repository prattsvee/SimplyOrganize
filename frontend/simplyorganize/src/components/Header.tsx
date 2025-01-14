// src/components/Header.tsx
import React, { useState } from "react";

const Header: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("All");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <header className="h-14 border-b flex items-center px-6">
      <nav className="flex gap-6">
        {["All", "Today", "Upcoming"].map((tab) => (
          <div
            key={tab}
            className={`py-4 ${
              activeTab === tab ? "border-b-2 border-gray-900 font-bold" : "text-gray-600"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </div>
        ))}
      </nav>
    </header>
  );
};

export default Header;
