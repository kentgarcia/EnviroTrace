import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Trees, Sprout, wind, CloudRain } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">About Urban Greening</h1>
        <p className="text-gray-500">Learn about our mission to create a sustainable and greener city.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Trees className="h-6 w-6" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              The <strong>Urban Greening Initiative</strong> is dedicated to enhancing the environmental quality and livability of our city through strategic tree planting, maintenance, and monitoring. We believe that a robust urban forest is essential for a healthy, resilient, and beautiful community.
            </p>
            <p>
              Our comprehensive system allows city planners, environmental officers, and the public to track tree inventory, monitor health status, and manage greening projects efficiently.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-blue-600" />
              Key Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Increase total urban canopy cover by 20% over 5 years.</li>
              <li>Promote native species biodiversity.</li>
              <li>Mitigate urban heat island effects.</li>
              <li>Improve air quality and carbon sequestration.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-600" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Reduction in stormwater runoff.</li>
              <li>Lower energy costs for cooling buildings.</li>
              <li>Habitat creation for local wildlife.</li>
              <li>Noise reduction and aesthetic improvement.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
