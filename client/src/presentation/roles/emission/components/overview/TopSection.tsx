import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { CarFront, CheckCircle, BarChart3, Building2 } from "lucide-react";
import { Card } from "../../../../components/shared/ui/card";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Total Vehicles",
    icon: CarFront,
    key: "totalVehicles",
    color: "text-blue-700 bg-blue-100",
    route: "/government-emission/vehicles-detail",
  },
  {
    label: "Tested Vehicles",
    icon: CheckCircle,
    key: "testedVehicles",
    color: "text-green-700 bg-green-100",
    route: "/government-emission/tested-vehicles",
  },
  {
    label: "Compliance Rate",
    icon: BarChart3,
    key: "complianceRate",
    color: "text-yellow-700 bg-yellow-100",
    isPercent: true,
    route: "/government-emission/compliance",
  },
  {
    label: "Departments",
    icon: Building2,
    key: "officeDepartments",
    color: "text-purple-700 bg-purple-100",
    route: "/government-emission/departments",
  },
];

const TopSection = ({ data, loading, formatNumber, selectedYear, selectedQuarter }: any) => {
  const navigate = useNavigate();

  const handleStatClick = (route: string) => {
    navigate({
      to: route,
      search: {
        year: selectedYear?.toString(),
        quarter: selectedQuarter?.toString()
      }
    });
  };

  return (
    <section className="w-full flex flex-col gap-6 mb-10 px-0 pt-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, icon: Icon, key, color, isPercent, route }) => (
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            key={key}
            className="cursor-pointer"
            onClick={() => handleStatClick(route)}
          >
            <Card hoverable className="flex items-center gap-4 p-5 bg-white transition-all hover:shadow-lg">
              <span
                className={`p-3 text-xl ${color.replace(/bg-[^ ]+/, "bg-white")}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">
                  {isPercent
                    ? `${loading ? 0 : data[key]}%`
                    : formatNumber(loading ? 0 : data[key])}
                </span>
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TopSection;
