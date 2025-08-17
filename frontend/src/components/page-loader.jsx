import React from "react";
import { Loader2 } from "lucide-react"; // ShadCN uses lucide-react for icons

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );
};

export default PageLoader;
