import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">TaskMaster</div>
      <div className="menu">
        <span>All</span>
        <span>Today</span>
        <span>Upcoming</span>
      </div>
      <div className="actions">
        <span className="add-task">Add Task</span>
        <span className="notification-icon">🔔</span>
      </div>
    </header>
  );
};

export default Header;
