import React from "react";
import MapView from "./MapView";

// Demo data with multiple locations to show clustering
const demoRequests = [
    {
        id: "REQ-001",
        title: "Tree Planting Request - Central Park",
        description: "Request for monitoring tree planting activities in Central Park area",
        requesterName: "John Doe",
        date: "2024-01-15",
        status: "approved" as const,
        location: { lat: 14.5995, lng: 120.9842 },
        address: "Central Park, Manila",
    },
    {
        id: "REQ-002",
        title: "Urban Forest Maintenance",
        description: "Regular maintenance and health check of existing urban forest",
        requesterName: "Jane Smith",
        date: "2024-01-20",
        status: "in-progress" as const,
        location: { lat: 14.6091, lng: 121.0223 },
        address: "Quezon City Memorial Circle",
    },
    {
        id: "REQ-003",
        title: "New Green Space Development",
        description: "Monitoring request for new green space development project",
        requesterName: "Mike Johnson",
        date: "2024-01-25",
        status: "pending" as const,
        location: { lat: 14.5547, lng: 121.0244 },
        address: "Makati Business District",
    },
    {
        id: "REQ-004",
        title: "Mangrove Restoration",
        description: "Coastal mangrove restoration monitoring",
        requesterName: "Sarah Connor",
        date: "2024-02-01",
        status: "completed" as const,
        location: { lat: 14.6760, lng: 121.0437 },
        address: "Manila Bay Area",
    },
    {
        id: "REQ-005",
        title: "School Garden Project",
        description: "Elementary school garden monitoring",
        requesterName: "Teacher Maria",
        date: "2024-02-05",
        status: "rejected" as const,
        location: { lat: 14.5794, lng: 120.9800 },
        address: "Ermita Elementary School",
    },
    // Add more locations for clustering demo
    {
        id: "REQ-006",
        title: "Rooftop Garden Initiative",
        description: "Office building rooftop garden monitoring",
        requesterName: "Office Manager",
        date: "2024-02-10",
        status: "approved" as const,
        location: { lat: 14.5580, lng: 121.0250 }, // Close to REQ-003 for clustering
        address: "Makati CBD Building A",
    },
    {
        id: "REQ-007",
        title: "Community Park Enhancement",
        description: "Enhancing existing community park green spaces",
        requesterName: "Community Leader",
        date: "2024-02-12",
        status: "in-progress" as const,
        location: { lat: 14.5555, lng: 121.0230 }, // Close to REQ-003 for clustering
        address: "Makati Community Park",
    },
    {
        id: "REQ-008",
        title: "Street Tree Maintenance",
        description: "Regular street tree maintenance and pruning",
        requesterName: "City Maintenance",
        date: "2024-02-15",
        status: "pending" as const,
        location: { lat: 14.6100, lng: 121.0200 }, // Close to REQ-002 for clustering
        address: "Quezon Avenue",
    },
];

const MapViewDemo: React.FC = () => {
    const handleSelectRequest = (id: string) => {
        console.log("Selected request:", id);
        // In a real app, this would navigate to the request details
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Map View Demo - Clustering & Filtering
                </h1>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Interactive Map with {demoRequests.length} Monitoring Requests
                    </h2>

                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <p>✨ <strong>Features demonstrated:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Marker clustering (markers close together are grouped)</li>
                            <li>Status-based filtering (use the filter controls on the map)</li>
                            <li>Search functionality (search by title, requester, or address)</li>
                            <li>Custom status-colored icons</li>
                            <li>Interactive popups with request details</li>
                            <li>Responsive map controls</li>
                        </ul>
                    </div>

                    <MapView
                        requests={demoRequests}
                        onSelectRequest={handleSelectRequest}
                        height={600}
                        center={{ lat: 14.5995, lng: 121.0223 }}
                        zoom={12}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapViewDemo;
