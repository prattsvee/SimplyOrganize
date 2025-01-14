// src/pages/Inbox.tsx
import React from 'react';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';

const Inbox = () => {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onTabChange={(tab) => console.log(`Selected Tab: ${tab}`)} />
        <main className="p-8">
          <h1 className="text-2xl mb-6">Inbox</h1>
          {/* Add your inbox content here */}
        </main>
      </div>
    </div>
  );
};

export default Inbox;