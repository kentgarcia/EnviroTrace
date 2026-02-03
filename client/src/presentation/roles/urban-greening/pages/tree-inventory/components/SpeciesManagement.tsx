// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/SpeciesManagement.tsx
/**
 * Species Management Component - Re-exports shared component
 * This file maintains backward compatibility while using the shared component
 */

import { SpeciesManagement as SharedSpeciesManagement } from "@/presentation/components/shared/species";

const SpeciesManagement = () => (
  <SharedSpeciesManagement
    title="Species Database"
    description="Manage species with environmental impact data for inventory tracking and urban greening"
  />
);

export default SpeciesManagement;
