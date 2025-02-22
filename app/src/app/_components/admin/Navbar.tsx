import React from "react";
import { ProjectSwitcher } from "./ProjectSwitcher";

export const Navbar: React.FC = React.memo(() => {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <img className="h-[32px] w-[114px]" src="/brand.svg" />
      <ProjectSwitcher />
    </div>
  );
});
Navbar.displayName = "Navbar";
