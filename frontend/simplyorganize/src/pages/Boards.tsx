// src/pages/Boards.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Boards = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <main className="p-8">
          <h1 className="text-2xl mb-6">This is the board</h1>
          <button onClick={() => navigate(-1)} className="btn-back">Back</button>
        </main>
      </div>
    </div>
  );
};

export default Boards;
