import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="avatar">
        <div className="profile-circle"></div>
        <span className="profile-text">View Profile</span>
      </div>
      <ul className="menu">
        <li>Projects</li>
        <li>Issues</li>
        <li>Boards</li>
        <li>Filters</li>
        <li>Calendar</li>
        <li>Inbox</li>
      </ul>
    </div>
  );
};

export default Sidebar;
