import { useState, useCallback } from "react";

interface VehicleRecord {
    id: string;
    plateNumber: string;
    vehicleType: string;
    operatorName: string;
    transportGroup: string;
    registrationDate: string;
    status: "active" | "suspended" | "expired";
    engineNumber?: string;
    chassisNumber?: string;
    model?: string;
    yearManufactured?: string;
    fuelType?: string;
    address?: string;
    contactNumber?: string;
    lastInspection?: string;
}

interface FileRecord {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    category: "registration" | "inspection" | "violation" | "other";
}

// Mock data for development
const mockRecords: VehicleRecord[] = [
    {
        id: "1",
        plateNumber: "ABC-1234",
        vehicleType: "Jeepney",
        operatorName: "Juan Dela Cruz",
        transportGroup: "TG-001",
        registrationDate: "2024-01-15",
        status: "active",
        engineNumber: "EN123456",
        chassisNumber: "CH789012",
        model: "Toyota Hiace",
        yearManufactured: "2020",
        fuelType: "Diesel",
        address: "123 Main St, Quezon City",
        contactNumber: "09171234567"
    },
    {
        id: "2",
        plateNumber: "DEF-5678",
        vehicleType: "Bus",
        operatorName: "Maria Santos",
        transportGroup: "TG-002",
        registrationDate: "2023-08-20",
        status: "suspended",
        engineNumber: "EN654321",
        chassisNumber: "CH210987",
        model: "Isuzu NPR",
        yearManufactured: "2019",
        fuelType: "Diesel",
        address: "456 Second St, Manila",
        contactNumber: "09281234567"
    },
    {
        id: "3",
        plateNumber: "GHI-9012",
        vehicleType: "Truck",
        operatorName: "Pedro Garcia",
        transportGroup: "TG-003",
        registrationDate: "2022-12-10",
        status: "expired",
        engineNumber: "EN789456",
        chassisNumber: "CH456789",
        model: "Mitsubishi Fuso",
        yearManufactured: "2018",
        fuelType: "Diesel",
        address: "789 Third St, Makati",
        contactNumber: "09391234567"
    }
];

const mockFiles: FileRecord[] = [
    {
        id: "f1",
        name: "Registration_Certificate.pdf",
        type: "application/pdf",
        size: 245760,
        uploadDate: "2024-01-15",
        category: "registration"
    },
    {
        id: "f2",
        name: "Inspection_Report_2024.pdf",
        type: "application/pdf",
        size: 189440,
        uploadDate: "2024-02-01",
        category: "inspection"
    },
    {
        id: "f3",
        name: "Vehicle_Photo.jpg",
        type: "image/jpeg",
        size: 512000,
        uploadDate: "2024-01-15",
        category: "other"
    }
];

export const useRecordsAndFilesData = () => {
    const [searchResults, setSearchResults] = useState<VehicleRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<VehicleRecord | null>(null);
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [activeTab, setActiveTab] = useState<"details" | "history" | "violations">("details");
    
    // Loading states
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isFilesLoading, setIsFilesLoading] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        setIsSearchLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            if (!query.trim()) {
                setSearchResults([]);
            } else {
                const filtered = mockRecords.filter(record =>
                    record.plateNumber.toLowerCase().includes(query.toLowerCase()) ||
                    record.operatorName.toLowerCase().includes(query.toLowerCase()) ||
                    record.transportGroup.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(filtered);
            }
            setIsSearchLoading(false);
        }, 300);
    }, []);

    const handleSelectRecord = useCallback(async (record: VehicleRecord) => {
        setSelectedRecord(record);
        setIsFilesLoading(true);
        
        // Simulate loading files for the selected record
        setTimeout(() => {
            // In real implementation, filter files by record.id
            setFiles(mockFiles);
            setIsFilesLoading(false);
        }, 500);
    }, []);

    const handleFileUpload = useCallback(async (file: File, category: string) => {
        if (!selectedRecord) return;

        // Simulate file upload
        const newFile: FileRecord = {
            id: `f${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString().split('T')[0],
            category: category as any
        };

        setFiles(prev => [newFile, ...prev]);
        
        // Here you would typically upload to your backend
        console.log("Uploading file:", file.name, "for record:", selectedRecord.plateNumber);
    }, [selectedRecord]);

    const handleFileDelete = useCallback(async (fileId: string) => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        
        // Here you would typically delete from your backend
        console.log("Deleting file:", fileId);
    }, []);

    const handleFileDownload = useCallback(async (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            // Here you would typically download from your backend
            console.log("Downloading file:", file.name);
            
            // Simulate download
            const link = document.createElement('a');
            link.href = '#'; // In real implementation, this would be the file URL
            link.download = file.name;
            link.click();
        }
    }, [files]);

    return {
        // Data
        searchResults,
        selectedRecord,
        files,
        
        // Loading states
        isSearchLoading,
        isFilesLoading,
        
        // Actions
        handleSearch,
        handleSelectRecord,
        handleFileUpload,
        handleFileDelete,
        handleFileDownload,
        
        // UI state
        activeTab,
        setActiveTab,
    };
};
