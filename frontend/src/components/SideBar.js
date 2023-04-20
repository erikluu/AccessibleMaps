import React from "react";
import Path from "./Path";

const SideBar = (props) => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  if (props.isOpen) 
    return (
      <div className={sidebarClass}>
        <Path mapData={props.mapData} updateStops={props.updateStops} />
        <button onClick={props.toggleSidebar} className="sidebar-toggle">
          &#8249;
        </button>
      </div>
    );
  else
    return (
      <div className={sidebarClass}>
        <Path mapData={props.mapData} updateStops={props.updateStops}/>
        <button onClick={props.toggleSidebar} className="sidebar-toggle">
          &#8250;
        </button>
      </div>
    );
};

export default SideBar;