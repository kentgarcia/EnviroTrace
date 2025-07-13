import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import { AppSidebar } from "@/presentation/components/shared/layout/AppSidebar";
import { SidebarProvider } from "@/presentation/components/shared/ui/sidebar";
import { useDashboardData } from "@/core/hooks/emissions/useDashboardData";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { useToast } from "@/presentation/components/shared/ui/use-toast";
import TopSection from "../components/overview/TopSection";
import SelectionBar from "../components/overview/SelectionBar";
import PieChartsRow from "../components/overview/PieChartsRow";
import BarChartsRow from "../components/overview/BarChartsRow";
import {
  ChatbotProvider,
  useChatbot,
} from "../components/overview/ChatbotProvider";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
const FloatingChatUI: React.FC<{
  data: any;
  loading: boolean;
  formatNumber: (n: number) => string;
  selectedYear: number;
  selectedQuarter: number | undefined;
}> = ({ data, loading, formatNumber, selectedYear, selectedQuarter }) => {
  const {
    chatOpen,
    chatMinimized,
    chatHistory,
    setChatHistory,
    handleOpenChat,
    handleMinimizeChat,
    handleCloseChat,
  } = useChatbot();
  return (
    <>
      {/* Floating Assistant Button */}
      {!chatOpen && !chatMinimized && (
        <button
          className="fixed z-[9999] bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 flex items-center justify-center transition-all"
          aria-label="Open Summary Assistant"
          onClick={handleOpenChat}
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}
      {/* Minimized Button with animation and text */}
      {chatMinimized && !chatOpen && (
        <button
          className="fixed z-[9999] bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-4 transition-all animate-fade-in-left"
          aria-label="Continue Chat"
          onClick={handleOpenChat}
          style={{ minWidth: 0 }}
        >
          <MessageCircle className="h-7 w-7" />
          <span className="ml-2 font-semibold text-base transition-all animate-fade-in-left">
            Continue Chat
          </span>
        </button>
      )}
      {/* Floating Chat Window (not draggable, fixed position) */}
      {chatOpen && (
        <div className="fixed z-[9999] bottom-8 right-8 w-[95vw] max-w-md h-[70vh] bg-white flex flex-col border border-green-100 animate-fade-in-left">
          <div
            className="font-bold text-lg text-green-900 mb-2 flex items-center gap-2 p-4 border-b relative bg-green-100"
            style={{ userSelect: "none" }}
          >
            <MessageCircle className="h-6 w-6 text-green-700" />
            Summary Assistant
            <button
              className="absolute right-12 top-4 text-green-700 hover:text-green-900 p-1 transition"
              aria-label="Minimize Chatbot"
              onClick={handleMinimizeChat}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="5"
                  y="9"
                  width="10"
                  height="2"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              className="absolute right-4 top-4 text-green-700 hover:text-green-900 p-1 transition"
              aria-label="Close Chatbot"
              onClick={handleCloseChat}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L14 14M14 6L6 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
            <MenuChatbot
              data={data}
              loading={loading}
              formatNumber={formatNumber}
              selectedYear={selectedYear}
              selectedQuarter={selectedQuarter}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
            />
          </div>
        </div>
      )}
    </>
  );
};

const GovEmissionOverview: React.FC = () => {
  // State for year and quarter selection
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(
    undefined
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Available years for selection - last 5 years
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Use our dashboard data hook to fetch all required data
  const { data, loading, error } = useDashboardData(
    selectedYear,
    selectedQuarter
  );

  // Format for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Function to handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force a re-render by toggling the year and then setting it back
    const tempYear = selectedYear;
    setSelectedYear(tempYear - 1);

    setTimeout(() => {
      setSelectedYear(tempYear);
      setIsRefreshing(false);
      toast({
        title: "Dashboard Refreshed",
        description: "The dashboard data has been refreshed.",
      });
    }, 100);
  };

  useEffect(() => {
    // Log detailed error information when an error occurs
    if (error) {
      console.error("Dashboard data error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
  }, [error]);

  if (error) {
    return (
      <>
        <div className="flex min-h-screen w-full">
          <div className="flex-1 overflow-auto">
            <TopNavBarContainer dashboardType="government-emission" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""
                      }`}
                  />
                  Refresh Data
                </Button>
              </div>
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                <h3 className="font-medium">Error Loading Dashboard Data</h3>
                <p className="mb-2">
                  There was a problem connecting to the server. Please try again
                  later or contact support if the issue persists.
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium">
                    Technical Details
                  </summary>
                  <p className="mt-2 font-mono text-xs bg-red-100 p-2 rounded">
                    {error.message}
                  </p>
                </details>
              </div>

              <div className="p-6 bg-muted/50 rounded-md text-center">
                <p className="text-muted-foreground mb-4">
                  You can try selecting a different year or quarter, or click
                  the refresh button above.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedQuarter ? selectedQuarter.toString() : "all"}
                    onValueChange={(value) =>
                      setSelectedQuarter(
                        value === "all" ? undefined : Number(value)
                      )
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quarters</SelectItem>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <NetworkStatus />
      </>
    );
  }

  return (
    <>
      <ChatbotProvider>
        <div className="flex min-h-screen w-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopNavBarContainer dashboardType="government-emission" />
            {/* Header Section */}
            <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">
                Government Emission
              </h1>
            </div>

            {/* Body Section */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
              <div className="px-6">
                <TopSection
                  data={data}
                  loading={loading}
                  formatNumber={formatNumber}
                />
                <ColorDivider />

                <div className="pt-6">
                  <SelectionBar
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedQuarter={selectedQuarter}
                    setSelectedQuarter={setSelectedQuarter}
                    availableYears={availableYears}
                    handleRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    loading={loading}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <PieChartsRow data={data} loading={loading} />
                      <BarChartsRow data={data} loading={loading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FloatingChatUI
          data={data}
          loading={loading}
          formatNumber={formatNumber}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
        />
        <NetworkStatus />
      </ChatbotProvider>
    </>
  );
};

export default GovEmissionOverview;

// Add MenuChatbot component at the bottom of the file
const menuOptions = [
  { key: "compliance", label: "Show Compliance Summary" },
  { key: "topOffices", label: "Show Top Offices" },
  { key: "untested", label: "Show Untested Vehicles" },
];

function MenuChatbot({
  data,
  loading,
  formatNumber,
  selectedYear,
  selectedQuarter,
  chatHistory,
  setChatHistory,
}: any) {
  // Accept content as string | JSX.Element
  const [chat, setChat] = useState(
    chatHistory || [{ role: "assistant", content: "How can I help you?" }]
  );
  const [pending, setPending] = useState(false);
  const [lastMenu, setLastMenu] = useState<string | null>(null);
  // Compute compliance rate as the average of all office compliance rates
  const computedComplianceRate = React.useMemo(() => {
    if (
      loading ||
      !data.officeComplianceData ||
      data.officeComplianceData.length === 0
    )
      return 0;
    const sum = data.officeComplianceData.reduce(
      (acc: number, office: any) =>
        acc + (office.value ?? office.complianceRate ?? 0),
      0
    );
    return Math.round(sum / data.officeComplianceData.length);
  }, [loading, data.officeComplianceData]);

  // Keep chat in sync with parent state
  useEffect(() => {
    setChatHistory(chat);
    // eslint-disable-next-line
  }, [chat]);

  // Helper: build detailed responses
  function getResponse(option: string) {
    if (option === "compliance") {
      return (<div>
        <div>
          For <span className="font-bold text-green-800">{selectedYear}</span>
          {selectedQuarter ? <>, Q{selectedQuarter}</> : ", all quarters"},
          compliance rate is{" "}
          <span className="font-bold text-green-800">
            {computedComplianceRate}%
          </span>{" "}
          across{" "}
          <span className="font-bold text-green-800">
            {formatNumber(loading ? 0 : data.officeDepartments)}
          </span>{" "}
          departments.
        </div>
        <ul className="mt-2 text-xs text-green-900">
          {data.officeComplianceData &&
            data.officeComplianceData.length > 0 &&
            data.officeComplianceData.map((office: any) => (
              <li key={office.id}>
                <span className="font-bold text-green-700">
                  {office.label}
                </span>
                : {office.value}% compliance, {office.passedCount}/
                {office.vehicleCount} passed
              </li>
            ))}
        </ul>
      </div>
      );
    }
    if (option === "topOffices") {
      if (!data.officeComplianceData || data.officeComplianceData.length === 0)
        return "No office data available.";
      const sorted = [...data.officeComplianceData].sort(
        (a: any, b: any) => b.value - a.value
      );
      const top = sorted[0];
      const least = sorted[sorted.length - 1];
      return (
        <div>
          <div>
            <span className="font-bold text-green-700">Top Office:</span>{" "}
            {top.label} ({top.value}% compliance, {top.passedCount}/
            {top.vehicleCount} passed)
          </div>
          <div>
            <span className="font-bold text-red-700">Least Compliant:</span>{" "}
            {least.label} ({least.value}% compliance, {least.passedCount}/
            {least.vehicleCount} passed)
          </div>
        </div>
      );
    } if (option === "untested") {
      const untested = data.vehicleSummaries
        ? data.vehicleSummaries.filter((v: any) => v.latestTestResult === null)
        : [];
      if (untested.length === 0) {
        return (
          <span className="text-green-700">
            All vehicles have been tested. 🎉
          </span>
        );
      }
      return (
        <div>
          <span className="font-bold text-yellow-600">{untested.length}</span>{" "}
          vehicles are yet to be tested:
          <ul className="mt-2 text-xs text-green-900 list-disc list-inside">
            {untested.slice(0, 5).map((v: any, i: number) => (
              <li key={i}>
                {v.vehicleType} ({v.engineType}, {v.wheels} wheels) -{" "}
                {v.officeName}
              </li>
            ))}
            {untested.length > 5 && <li>...and {untested.length - 5} more</li>}
          </ul>
        </div>
      );
    }
    return "Sorry, I didn't understand that request.";
  }

  // Follow-up menu options based on last menu
  function getFollowUpOptions(last: string | null) {
    if (last === "compliance") {
      return [menuOptions[1], menuOptions[2]]; // Top Offices, Untested
    }
    if (last === "topOffices") {
      return [menuOptions[0], menuOptions[2]]; // Compliance, Untested
    }
    if (last === "untested") {
      return [menuOptions[0], menuOptions[1]]; // Compliance, Top Offices
    }
    return menuOptions;
  }

  // Handle menu click: add user message, then assistant response after delay
  function handleMenu(option: string, label: string) {
    if (pending) return;
    setChat((prev) => [...prev, { role: "user", content: label }]);
    setPending(true);
    setLastMenu(option);
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: getResponse(option) },
      ]);
      setPending(false);
    }, 700);
  }

  // Add fade-in animations (only once)
  React.useEffect(() => {
    if (!document.getElementById("chatbot-animations")) {
      const style = document.createElement("style");
      style.id = "chatbot-animations";
      style.innerHTML = `
      @keyframes fade-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: none; } }
      @keyframes fade-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
      .animate-fade-in-left { animation: fade-in-left 0.5s; }
      .animate-fade-in-right { animation: fade-in-right 0.5s; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto pb-[env(safe-area-inset-bottom),80px]">
      <div className="flex-1 flex flex-col gap-3">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"
              }`}
          >
            <div
              className={`px-4 py-3 max-w-[80%] text-sm transition-all duration-500 ${msg.role === "assistant"
                ? "bg-green-100 text-green-900 animate-fade-in-left"
                : "bg-green-600 text-white animate-fade-in-right"
                }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {typeof msg.content === "string" ? msg.content : msg.content}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="px-4 py-3 max-w-[80%] text-sm bg-green-100 text-green-900 animate-pulse">
              ...
            </div>
          </div>
        )}
      </div>
      {/* Menu options always below the chat */}
      <div className="flex flex-col gap-2 mt-4">
        {getFollowUpOptions(lastMenu).map((option) => (
          <button
            key={option.key}
            className="text-left px-4 py-2 border border-green-200 bg-green-100 hover:bg-green-200 text-green-900 font-medium transition"
            onClick={() => handleMenu(option.key, option.label)}
            disabled={pending}
          >
            {option.label}
          </button>
        ))}
      </div>
      {/* Safe area at the bottom */}
      <div className="h-8" />
    </div>
  );
}

// Add fade-in animations
const style = document.createElement("style");
style.innerHTML = `
@keyframes fade-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: none; } }
@keyframes fade-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
.animate-fade-in-left { animation: fade-in-left 0.5s; }
.animate-fade-in-right { animation: fade-in-right 0.5s; }
`;
document.head.appendChild(style);
