// client/src/presentation/roles/urban-greening/pages/greening-projects/components/SpeciesManagement.tsx
/**
 * Species Management Component - Re-exports shared component
 * This file maintains backward compatibility while using the shared component
 */

import { SpeciesManagement as SharedSpeciesManagement } from "@/presentation/components/shared/species";

const SpeciesManagement = () => (
  <SharedSpeciesManagement
    title="Species Reference"
    description="Maintain uniform species names for greening project categorization"
  />
);

export default SpeciesManagement;
