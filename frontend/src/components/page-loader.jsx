import React from "react";
import { Loader2 } from "lucide-react"; 

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
    </div>
  );
};

export default PageLoader;
