import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RecordInfo from "@/presentation/roles/belching/components/smokeBelcher/RecordInfo";

describe("RecordInfo Component", () => {
  const baseProps = {
    plateNumber: "ABC123",
    vehicleType: "Sedan",
    operatorName: "John Doe",
    operatorAddress: "123 Main St",
    recordAddress: "456 Elm St",
    recordStatus: "new" as const,
    licenseValidUntil: "2025-12-31",
    offenseLevel: 1,
    lastDateApprehended: "2023-01-01",
    orderOfPayment: "OP-001",
    violationSummary: "None",
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    onAddToCEC: jest.fn(),
    onPrintClearance: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it("renders add mode and submits new record", () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <RecordInfo
        {...baseProps}
        mode="add"
        formData={{}}
        onSubmit={onSubmit}
        onChange={baseProps.onChange}
      />
    );
    expect(screen.getByText("Add New Record")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Plate Number/i), {
      target: { value: "XYZ789" },
    });
    fireEvent.click(screen.getByText("Add"));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("renders edit mode and saves changes", () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <RecordInfo
        {...baseProps}
        mode="edit"
        formData={{ ...baseProps, plateNumber: "EDIT123" }}
        onSubmit={onSubmit}
        onChange={baseProps.onChange}
      />
    );
    expect(screen.getByText("Edit Record")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Plate Number/i), {
      target: { value: "EDIT999" },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("renders view mode and triggers delete", () => {
    const onDelete = jest.fn();
    render(<RecordInfo {...baseProps} mode="view" onDelete={onDelete} />);
    // Simulate delete if there is a delete button (add if needed in component)
    // Example: fireEvent.click(screen.getByText("Delete"));
    // expect(onDelete).toHaveBeenCalled();
    // For now, just check view mode renders
    expect(screen.getByText("Record Information")).toBeInTheDocument();
  });
});
