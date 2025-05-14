import React from "react";
import { CarFront, CheckCircle, BarChart3, Building2 } from "lucide-react";

const TopSection = ({ data, loading, formatNumber }: any) => (
  <section
    className="w-full relative flex flex-col justify-end mb-8 px-0 pt-0 pb-20 min-h-[340px] rounded-b-3xl overflow-hidden"
    style={{ minHeight: 340 }}
  >
    {/* Background image with gradient overlay */}
    <div className="absolute inset-0 z-0">
      <img
        src="/images/bg_govemissions.jpg"
        alt="Background"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 via-green-700/40 to-green-400/30" />
    </div>
    {/* Small card at bottom left for details and stats */}
    <div className="absolute left-6 bottom-6 z-20">
      <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col gap-3 min-w-[340px] border border-gray-100">
        {/* Title and description */}
        <div className="font-bold text-xl text-gray-900 mb-0.5">
          Government Emission Dashboard
        </div>
        <div className="text-gray-500 text-sm mb-2">
          Monitor and manage emission testing for government vehicles. Stay
          updated with the latest compliance and testing data.
        </div>
        {/* Stats row inside the card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="bg-green-200 text-green-700 rounded-full p-2">
              <CarFront className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-bold text-green-800">
                {formatNumber(loading ? 0 : data.totalVehicles)}
              </div>
              <div className="text-xs text-green-700">Total Vehicles</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-200 text-green-700 rounded-full p-2">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-bold text-green-800">
                {formatNumber(loading ? 0 : data.testedVehicles)}
              </div>
              <div className="text-xs text-green-700">Tested Vehicles</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-200 text-green-700 rounded-full p-2">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-bold text-green-800">
                {loading ? 0 : data.complianceRate}%
              </div>
              <div className="text-xs text-green-700">Compliance Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-200 text-green-700 rounded-full p-2">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-bold text-green-800">
                {formatNumber(loading ? 0 : data.officeDepartments)}
              </div>
              <div className="text-xs text-green-700">Departments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TopSection;
