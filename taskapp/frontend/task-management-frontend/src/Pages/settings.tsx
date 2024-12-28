import React from "react";
import "./Settings.css";

const Settings: React.FC = () => {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <form>
        <label>
          <span>Email Notifications</span>
          <input type="checkbox" />
        </label>
        <label>
          <span>Dark Mode</span>
          <input type="checkbox" />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Settings;
