import React from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";

interface SearchFormProps {
    form: {
        name: string;
        license_no: string;
        plate_no: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    onAddDriverClick: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
    form,
    handleChange,
    handleSubmit,
    loading,
    onAddDriverClick,
}) => {
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow space-y-4 mb-6"
        >
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-blue-900">Driver Query</h2>
                <Button
                    type="button"
                    onClick={onAddDriverClick}
                    className="bg-green-700 text-white text-sm"
                    size="sm"
                >
                    Add Driver
                </Button>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Driver Name
                    </label>
                    <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter driver name"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        License No.
                    </label>
                    <Input
                        name="license_no"
                        value={form.license_no}
                        onChange={handleChange}
                        placeholder="Enter license number"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Plate No.
                    </label>
                    <Input
                        name="plate_no"
                        value={form.plate_no}
                        onChange={handleChange}
                        placeholder="Enter plate number"
                    />
                </div>
            </div>
            <div className="pt-2">
                <Button type="submit" className="w-full bg-blue-700 text-white" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </Button>
            </div>
        </form>
    );
};

export default SearchForm;
