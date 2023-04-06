import React from "react";

const SideBar = props => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  if (props.isOpen) 
    return (
      <div className={sidebarClass}>
        <div> content </div>
        <button onClick={props.toggleSidebar} className="sidebar-toggle">
          &#8249;
        </button>
      </div>
    );
  else
    return (
      <div className={sidebarClass}>
        <div> content </div>
        <button onClick={props.toggleSidebar} className="sidebar-toggle">
          &#8250;
        </button>
      </div>
    );
};

export default SideBar;