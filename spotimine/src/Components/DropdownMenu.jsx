import React from "react";
export function DropdownMenu({}) {
  return <nav className="dropdownMenu">
                <button className="dropdownMenuButton">
                </button>
                <div className="dropdownMenuContent">
                    <a href="/">Home</a>
                    <br />
                    <a href="/browse">Browse</a>
                    <br />
                    <a href="/add_tracks">Add Tracks</a>
                </div>
            </nav>;
}
  