import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTauriStore } from "@/hooks/useTauriStore";
import { Vehicle } from "./types";
import { toast } from "sonner";

/**
 * Custom React hook to manage vehicles data, filtering, and offline/online sync for the government emission dashboard.
 *
 * @returns Object containing vehicles data, filters, and utility functions for managing vehicles.
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);
  const { get, set, save } = useTauriStore(".vehicles-data.dat");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [engineTypeFilter, setEngineTypeFilter] = useState<string>("all");
  const [wheelsFilter, setWheelsFilter] = useState<string>("all");

  // Vehicle type, engine type, and wheel count options
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [engineTypes, setEngineTypes] = useState<string[]>([]);
  const [wheelCounts, setWheelCounts] = useState<number[]>([]);

  // Load offline/online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Load vehicles from Supabase or Tauri Store
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    if (!navigator.onLine) {
      const cached = await get("vehicles_list");
      if (Array.isArray(cached) && cached.length > 0) {
        setVehicles(cached as Vehicle[]);
        setFilteredVehicles(cached as Vehicle[]);
        setOfflineNotice(true);
      } else {
        setVehicles([]);
        setFilteredVehicles([]);
        setOfflineNotice(true);
      }
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("vehicle_summary_view")
      .select("*")
      .order("plate_number", { ascending: true });
    if (error) {
      const cached = await get("vehicles_list");
      if (Array.isArray(cached) && cached.length > 0) {
        setVehicles(cached as Vehicle[]);
        setFilteredVehicles(cached as Vehicle[]);
        setOfflineNotice(true);
      } else {
        setVehicles([]);
        setFilteredVehicles([]);
        setOfflineNotice(true);
      }
      setIsLoading(false);
      toast.error("Failed to load vehicles data. Showing last available data.");
      return;
    }
    setVehicles(data as Vehicle[]);
    setFilteredVehicles(data as Vehicle[]);
    setOfflineNotice(false);
    await set("vehicles_list", data);
    await save();
    setIsLoading(false);
  }, [get, set, save]);

  // Load pending vehicles from Tauri Store
  const loadPending = useCallback(async () => {
    const pending = await get("pending_vehicles");
    if (Array.isArray(pending)) setPendingVehicles(pending as Vehicle[]);
    else setPendingVehicles([]);
  }, [get]);

  // Load vehicle/engine/wheel options
  useEffect(() => {
    const extractOptions = (vehicles: Vehicle[]) => {
      setVehicleTypes(Array.from(new Set(vehicles.map(v => v.vehicle_type)).values()));
      setEngineTypes(Array.from(new Set(vehicles.map(v => v.engine_type)).values()));
      setWheelCounts(Array.from(new Set(vehicles.map(v => v.wheels)).values()));
    };
    extractOptions(vehicles);
  }, [vehicles]);

  // Fetch vehicles and subscribe to changes
  useEffect(() => {
    let subscription: any = null;
    const fetchAndSubscribe = async () => {
      if (!isOffline) {
        await fetchVehicles();
        subscription = supabase
          .channel("vehicle_changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, () => {
            fetchVehicles();
          })
          .subscribe();
      } else {
        await fetchVehicles();
        await loadPending();
      }
    };
    fetchAndSubscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isOffline, fetchVehicles, loadPending]);

  // Sync pending vehicles when online
  useEffect(() => {
    if (!isOffline && pendingVehicles.length > 0) {
      const syncPending = async () => {
        for (const v of pendingVehicles) {
          try {
            await supabase.from("vehicles").insert({
              plate_number: v.plate_number,
              driver_name: v.driver_name,
              office_name: v.office_name,
              vehicle_type: v.vehicle_type,
              engine_type: v.engine_type,
              wheels: v.wheels,
              contact_number: v.contact_number
            });
          } catch (e) {
            toast.error("Some vehicles failed to sync. Will retry later.");
            return;
          }
        }
        await set("pending_vehicles", []);
        await save();
        setPendingVehicles([]);
        toast.success("Pending vehicles synced!");
      };
      syncPending();
    }
  }, [isOffline, pendingVehicles, set, save]);

  // Filtering logic
  useEffect(() => {
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.office_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true :
        statusFilter === "passed" ? vehicle.latest_test_result === true :
        statusFilter === "failed" ? vehicle.latest_test_result === false :
        vehicle.latest_test_result === null;
      const matchesVehicleType =
        vehicleTypeFilter === "all" ? true : vehicle.vehicle_type === vehicleTypeFilter;
      const matchesEngineType =
        engineTypeFilter === "all" ? true : vehicle.engine_type === engineTypeFilter;
      const matchesWheels =
        wheelsFilter === "all" ? true : vehicle.wheels === parseInt(wheelsFilter);
      return matchesSearch && matchesStatus && matchesVehicleType && matchesEngineType && matchesWheels;
    });
    setFilteredVehicles(filtered);
  }, [searchQuery, statusFilter, vehicleTypeFilter, engineTypeFilter, wheelsFilter, vehicles]);

  return {
    vehicles,
    filteredVehicles,
    pendingVehicles,
    isLoading,
    isOffline,
    offlineNotice,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    vehicleTypeFilter,
    setVehicleTypeFilter,
    engineTypeFilter,
    setEngineTypeFilter,
    wheelsFilter,
    setWheelsFilter,
    vehicleTypes,
    engineTypes,
    wheelCounts,
    fetchVehicles,
    loadPending,
    setPendingVehicles,
    set,
    save
  };
}
