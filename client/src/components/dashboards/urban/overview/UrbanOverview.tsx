import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface UrbanOverviewProps {
  plantSaplingsCollected: number;
  urbanGreening: {
    ornamentalPlants: number;
    trees: number;
  };
  urbanGreeningBreakdown: {
    seeds: number;
    seedsPrivate: number;
    trees: number;
    ornamentals: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const UrbanOverview: React.FC<UrbanOverviewProps> = ({
  plantSaplingsCollected,
  urbanGreening,
  urbanGreeningBreakdown,
}) => {
  const pieData = [
    { name: "Seeds", value: urbanGreeningBreakdown.seeds },
    { name: "Seeds (Private)", value: urbanGreeningBreakdown.seedsPrivate },
    { name: "Trees", value: urbanGreeningBreakdown.trees },
    { name: "Ornamentals", value: urbanGreeningBreakdown.ornamentals },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Plant Saplings Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plantSaplingsCollected}</div>
            <p className="text-sm text-muted-foreground">
              Total replacements for the year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Urban Greening</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold">
                  {urbanGreening.ornamentalPlants}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ornamental Plants
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold">{urbanGreening.trees}</div>
                <p className="text-sm text-muted-foreground">Trees Planted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Urban Greening Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
