import React from "react";
import { SpeciesManagement as SharedSpeciesManagement } from "@/presentation/components/shared/species";

const SpeciesManagementPage = () => {
  return (
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Species Management</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage tree species with environmental impact data for inventory tracking
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
             <SharedSpeciesManagement
                className="h-full border-0 shadow-none p-0" 
              />
        </div>
    </div>
  );
};

export default SpeciesManagementPage;
