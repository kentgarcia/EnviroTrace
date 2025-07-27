import { useState, useCallback } from "react";
import { Fee, FeeCreate } from "./useFeeData";

export const useFeeForm = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [editForm, setEditForm] = useState<Partial<Fee>>({});

  const [addForm, setAddForm] = useState<FeeCreate>({
    category: "",
    rate: 0,
    date_effective: "",
    offense_level: 0,
  });

  const handleFeeSelect = useCallback((fee: Fee) => {
    setSelectedFee(fee);
    setEditForm({
      category: fee.category,
      rate: fee.rate,
      date_effective: fee.date_effective,
      offense_level: fee.offense_level,
    });
  }, []);

  const resetAddForm = useCallback(() => {
    setAddForm({
      category: "",
      rate: 0,
      date_effective: "",
      offense_level: 0,
    });
    setShowAddForm(false);
  }, []);

  const resetSelectedFee = useCallback(() => {
    setSelectedFee(null);
    setEditForm({});
  }, []);

  const toggleAddForm = useCallback(() => {
    setShowAddForm((prev) => !prev);
  }, []);

  const updateAddFormField = useCallback(
    (field: keyof FeeCreate, value: string | number) => {
      setAddForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const updateEditFormField = useCallback(
    (field: keyof Omit<Fee, "fee_id">, value: string | number) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const validateAddForm = useCallback(() => {
    return (
      addForm.category.trim() !== "" &&
      addForm.rate > 0 &&
      addForm.date_effective !== "" &&
      addForm.offense_level > 0
    );
  }, [addForm]);

  const validateEditForm = useCallback(() => {
    return (
      editForm.category?.trim() !== "" &&
      editForm.rate !== undefined &&
      editForm.rate > 0 &&
      editForm.date_effective !== "" &&
      editForm.offense_level !== undefined &&
      editForm.offense_level > 0
    );
  }, [editForm]);

  return {
    // Form state
    showAddForm,
    selectedFee,
    editForm,
    addForm,

    // Form actions
    handleFeeSelect,
    resetAddForm,
    resetSelectedFee,
    toggleAddForm,
    updateAddFormField,
    updateEditFormField,
    validateAddForm,
    validateEditForm,
  };
};
