"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosResponse } from "axios";
import {
  SquareActivity,
  RotateCcwSquare,
  Plus,
  Edit3,
  Trash2,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  BarChart3,
  Menu,
  X,
  Clock,
  Server,
  Eye,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { motion } from "framer-motion";

// Type definitions
interface User {
  name: string;
  email: string;
  verified: boolean;
}

interface WebService {
  id: number;
  webservice_name: string;
  webservice_url: string;
  is_active: boolean;
  email_alert: boolean;
  monitor_interval: number;
  expect_status_code: number;
}

interface WebStatus {
  id: number;
  status: boolean;
  ping: number;
  status_code: number;
  date_and_time: string;
}

interface ServiceAnalytics {
  totalChecks: number;
  uptime: number;
  avgPing: number;
  downtimeCount: number;
  lastDowntime: Date | null;
  recentUptime: number;
  recentChecks: number;
}

interface ChartDataPoint {
  date: string;
  uptime: number;
  avgPing: number;
}

interface FormData {
  webservice_name: string;
  webservice_url: string;
  is_active: boolean;
  email_alert: boolean;
  monitor_interval: string;
  expect_status_code: string;
}

// API Response interfaces
interface AuthUserResponse {
  user: {
    first_name: string;
    email: string;
    is_email_verified: boolean;
  };
}

interface WebServicesResponse {
  success: boolean;
  webservices: WebService[];
}

interface WebStatusResponse {
  success: boolean;
  webstatus: WebStatus[];
}

interface WebServiceResponse {
  success: boolean;
  webservice: WebService;
}

interface TokenRefreshResponse {
  access: string;
}

const Page: React.FC = () => {
  const router = useRouter();

  // State management
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    verified: false,
  });
  const [greet, setGreet] = useState<string>("");
  const [webServices, setWebServices] = useState<WebService[]>([]);
  const [webStatuses, setWebStatuses] = useState<Record<number, WebStatus[]>>(
    {}
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<WebService | null>(
    null
  );

  // Form states
  const [formData, setFormData] = useState<FormData>({
    webservice_name: "",
    webservice_url: "",
    is_active: true,
    email_alert: true,
    monitor_interval: "10",
    expect_status_code: "200",
  });

  // Authentication helpers
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return null;

      const response: AxiosResponse<TokenRefreshResponse> = await axios.post(
        `${process.env.NEXT_PUBLIC_B_URL}/api/token/refresh/`,
        { refresh: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("access_token", newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error("Failed to refresh access token", err);
      router.push("/login");
      return null;
    }
  }, [router]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // API calls
  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse<AuthUserResponse> = await axios.get(
        `${process.env.NEXT_PUBLIC_B_URL}/api/auth/user/`,
        {
          headers: getAuthHeaders(),
          validateStatus: (status) => status >= 200 && status < 600,
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
        return;
      }

      if (!response.data.user.is_email_verified) {
        router.push("/verifyemail?sent=0");
        return;
      }

      setUser({
        name: response.data.user.first_name,
        email: response.data.user.email,
        verified: response.data.user.is_email_verified,
      });
    } catch (err) {
      console.error("Failed to fetch user", err);
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
        return;
      }
      setError("Failed to load user data");
    }
  }, [getAuthHeaders, router]);

  const fetchWebServices = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse<WebServicesResponse> = await axios.get(
        `${process.env.NEXT_PUBLIC_B_URL}/api/webservice/all/`,
        {
          headers: getAuthHeaders(),
          validateStatus: (status) => status >= 200 && status < 600,
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
        return;
      }

      if (response.data.success) {
        setWebServices(response.data.webservices);
        // Select first service by default
        if (response.data.webservices.length > 0 && !selectedServiceId) {
          setSelectedServiceId(response.data.webservices[0].id);
        }
        // Fetch statuses for all services
        await fetchAllWebStatuses(response.data.webservices);
      }
    } catch (err) {
      console.error("Failed to fetch web services", err);
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
        return;
      }
      setError("Failed to load web services");
    }
  }, [getAuthHeaders, router, selectedServiceId]);

  const fetchAllWebStatuses = useCallback(
    async (services: WebService[] = webServices): Promise<void> => {
      try {
        const statusPromises = services.map(async (service) => {
          try {
            const response: AxiosResponse<WebStatusResponse> = await axios.get(
              `${process.env.NEXT_PUBLIC_B_URL}/api/webservice/${service.id}/webstatus/`,
              { headers: getAuthHeaders() }
            );

            if (response.data.success) {
              setWebStatuses((prev) => ({
                ...prev,
                [service.id]: response.data.webstatus,
              }));
            }
          } catch (serviceErr) {
            console.error(
              `Failed to fetch status for service ${service.id}`,
              serviceErr
            );
            setWebStatuses((prev) => ({
              ...prev,
              [service.id]: prev[service.id] || [],
            }));
          }
        });

        await Promise.all(statusPromises);
      } catch (err) {
        console.error("Failed to fetch web statuses", err);
        setError("Failed to load monitoring data");
      }
    },
    [webServices, getAuthHeaders]
  );

  // Handle service selection with mobile sidebar auto-close
  const handleServiceSelect = useCallback((serviceId: number): void => {
    setSelectedServiceId(serviceId);
    // Auto-close sidebar on mobile/tablet when service is selected
    if (window.innerWidth < 1024) {
      // lg breakpoint
      setSidebarOpen(false);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const selectedServiceData = selectedServiceId
        ? webServices.find((s) => s.id === selectedServiceId)
        : null;
      await fetchAllWebStatuses(
        selectedServiceData ? [selectedServiceData] : webServices
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const addWebService = useCallback(async (): Promise<void> => {
    try {
      setError("");
      const response: AxiosResponse<WebServiceResponse> = await axios.post(
        `${process.env.NEXT_PUBLIC_B_URL}/api/webservice/add/`,
        {
          ...formData,
          monitor_interval: parseInt(formData.monitor_interval),
          expect_status_code: parseInt(formData.expect_status_code),
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const newServices = [...webServices, response.data.webservice];
        setWebServices(newServices);
        setIsAddDialogOpen(false);
        resetForm();
        setSelectedServiceId(response.data.webservice.id);
        setWebStatuses((prev) => ({
          ...prev,
          [response.data.webservice.id]: [],
        }));
      } else {
        setError("Failed to add web service");
      }
    } catch (err) {
      console.error("Failed to add web service", err);
      setError("Failed to add web service");
    }
  }, [formData, getAuthHeaders, webServices]);

  const updateWebService = useCallback(async (): Promise<void> => {
    if (!selectedService) return;

    try {
      setError("");
      const response: AxiosResponse<WebServiceResponse> = await axios.patch(
        `${process.env.NEXT_PUBLIC_B_URL}/api/webservice/${selectedService.id}/update/`,
        {
          ...formData,
          monitor_interval: parseInt(formData.monitor_interval),
          expect_status_code: parseInt(formData.expect_status_code),
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const updatedServices = webServices.map((ws) =>
          ws.id === selectedService.id ? response.data.webservice : ws
        );
        setWebServices(updatedServices);
        setIsEditDialogOpen(false);
        resetForm();
        setSelectedService(null);
      } else {
        setError("Failed to update web service");
      }
    } catch (err) {
      console.error("Failed to update web service", err);
      setError("Failed to update web service");
    }
  }, [selectedService, formData, getAuthHeaders, webServices]);

  const deleteWebService = useCallback(
    async (id: number): Promise<void> => {
      if (!confirm("Are you sure you want to delete this web service?")) return;

      try {
        setError("");
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_B_URL}/api/webservice/${id}/delete/`,
          { headers: getAuthHeaders() }
        );

        if (response.data.success) {
          const updatedServices = webServices.filter((ws) => ws.id !== id);
          setWebServices(updatedServices);
          const updatedStatuses = { ...webStatuses };
          delete updatedStatuses[id];
          setWebStatuses(updatedStatuses);
          if (selectedServiceId === id) {
            setSelectedServiceId(
              updatedServices.length > 0 ? updatedServices[0].id : null
            );
          }
        } else {
          setError("Failed to delete web service");
        }
      } catch (err) {
        console.error("Failed to delete web service", err);
        setError("Failed to delete web service");
      }
    },
    [getAuthHeaders, webServices, webStatuses, selectedServiceId]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_B_URL}/api/auth/logout/`,
        { refresh_token: refreshToken },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login");
    }
  }, [getAuthHeaders, router]);

  const resetForm = useCallback((): void => {
    setFormData({
      webservice_name: "",
      webservice_url: "",
      is_active: true,
      email_alert: true,
      monitor_interval: "10",
      expect_status_code: "200",
    });
  }, []);

  const greetUser = useCallback((): void => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 4 && hour < 12) {
      setGreet("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreet("Good afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreet("Good evening");
    } else {
      setGreet("Hello Night Owl");
    }
  }, []);

  const openEditDialog = useCallback((service: WebService): void => {
    setSelectedService(service);
    setFormData({
      webservice_name: service.webservice_name,
      webservice_url: service.webservice_url,
      is_active: service.is_active,
      email_alert: service.email_alert,
      monitor_interval: service.monitor_interval.toString(),
      expect_status_code: service.expect_status_code.toString(),
    });
    setIsEditDialogOpen(true);
  }, []);

  // Get analytics for selected service
  const getServiceAnalytics = useCallback(
    (serviceId: number): ServiceAnalytics | null => {
      const statuses = webStatuses[serviceId] || [];
      if (statuses.length === 0) return null;

      const total = statuses.length;
      const upCount = statuses.filter((s) => s.status).length;
      const uptime = Math.round((upCount / total) * 100);
      const avgPing = Math.round(
        statuses.reduce((acc, s) => acc + (s.ping || 0), 0) / total
      );

      const downStatuses = statuses.filter((s) => !s.status);
      const lastDowntime =
        downStatuses.length > 0
          ? new Date(
              downStatuses.sort(
                (a, b) =>
                  new Date(b.date_and_time).getTime() -
                  new Date(a.date_and_time).getTime()
              )[0].date_and_time
            )
          : null;

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentStatuses = statuses.filter(
        (s) => new Date(s.date_and_time) >= twentyFourHoursAgo
      );
      const recentUptime =
        recentStatuses.length > 0
          ? Math.round(
              (recentStatuses.filter((s) => s.status).length /
                recentStatuses.length) *
                100
            )
          : 0;

      return {
        totalChecks: total,
        uptime,
        avgPing,
        downtimeCount: downStatuses.length,
        lastDowntime,
        recentUptime,
        recentChecks: recentStatuses.length,
      };
    },
    [webStatuses]
  );

  // Generate chart data for selected service
  const generateChartData = useCallback(
    (serviceId: number): ChartDataPoint[] => {
      const statuses = webStatuses[serviceId] || [];
      if (statuses.length === 0) return [];

      const dailyData: Record<
        string,
        { total: number; up: number; totalPing: number }
      > = {};

      statuses.forEach((status) => {
        const date = new Date(status.date_and_time).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = { total: 0, up: 0, totalPing: 0 };
        }
        dailyData[date].total++;
        if (status.status) {
          dailyData[date].up++;
        }
        dailyData[date].totalPing += status.ping || 0;
      });

      return Object.entries(dailyData)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-7)
        .map(([date, data]) => ({
          date: date.split("/").slice(0, 2).join("/"),
          uptime: Math.round((data.up / data.total) * 100),
          avgPing: Math.round(data.totalPing / data.total),
        }));
    },
    [webStatuses]
  );

  // Get current service status
  const getCurrentServiceStatus = useCallback(
    (serviceId: number): WebStatus | null => {
      const statuses = webStatuses[serviceId] || [];
      if (statuses.length === 0) return null;
      return statuses.sort(
        (a, b) =>
          new Date(b.date_and_time).getTime() -
          new Date(a.date_and_time).getTime()
      )[0];
    },
    [webStatuses]
  );

  // Effects
  useEffect(() => {
    const initializeDashboard = async (): Promise<void> => {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          router.push("/login");
          return;
        }

        let accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          accessToken = await refreshAccessToken();
          if (!accessToken) {
            router.push("/login");
            return;
          }
        }

        await fetchUser();
        await fetchWebServices();
        greetUser();
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router, refreshAccessToken, fetchUser, fetchWebServices, greetUser]);

  // Handle window resize to auto-close sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedServiceData = selectedServiceId
    ? webServices.find((s) => s.id === selectedServiceId) || null
    : null;
  const serviceAnalytics = selectedServiceId
    ? getServiceAnalytics(selectedServiceId)
    : null;
  const chartData = selectedServiceId
    ? generateChartData(selectedServiceId)
    : [];
  const currentStatus = selectedServiceId
    ? getCurrentServiceStatus(selectedServiceId)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Activity className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 sm:w-72 md:w-80 lg:w-64 bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b h-16">
          <div className="flex items-center space-x-2">
            <SquareActivity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg sm:text-xl">Byte Ping</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-3 sm:p-4 max-h-[90vh] overflow-auto">
          <div className="space-y-4">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Web Services
            </div>

            {webServices.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Server className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No services yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {webServices.map((service) => {
                  const status = getCurrentServiceStatus(service.id);
                  const isSelected = selectedServiceId === service.id;

                  return (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors w-56 touch-manipulation ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted active:bg-muted"
                      }`}
                      onClick={() => handleServiceSelect(service.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {status ? (
                          status.status ? (
                            <CheckCircle
                              className="h-4 w-4 flex-shrink-0"
                              style={{ color: "var(--success-color)" }}
                            />
                          ) : (
                            <XCircle
                              className="h-4 w-4 flex-shrink-0"
                              style={{ color: "var(--destructive)" }}
                            />
                          )
                        ) : (
                          <Clock
                            className="h-4 w-4 flex-shrink-0"
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {service.webservice_name}
                          </p>
                          <p className="text-xs opacity-70 truncate">
                            {service.webservice_url}
                          </p>
                        </div>
                      </div>
                      {status && (
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{status.ping}ms</span>
                          <Badge
                            variant={
                              service.is_active ? "default" : "secondary"
                            }
                            className="h-4 text-xs"
                          >
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold sm:text-sm text-foreground hidden sm:inline"
              >
                {greet}, {user.name}!
              </motion.span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Service</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4">
                  <DialogHeader>
                    <DialogTitle>Add Web Service</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name</Label>
                      <Input
                        id="name"
                        value={formData.webservice_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            webservice_name: e.target.value,
                          })
                        }
                        placeholder="My Website"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={formData.webservice_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            webservice_url: e.target.value,
                          })
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monitor Interval (minutes)</Label>
                      <Select
                        value={formData.monitor_interval}
                        onValueChange={(value) =>
                          setFormData({ ...formData, monitor_interval: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">25 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status-code">Expected Status Code</Label>
                      <Input
                        id="status-code"
                        value={formData.expect_status_code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expect_status_code: e.target.value,
                          })
                        }
                        placeholder="200"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email-alert"
                        checked={formData.email_alert}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            email_alert: Boolean(checked),
                          })
                        }
                      />
                      <Label htmlFor="email-alert">Enable Email Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            is_active: Boolean(checked),
                          })
                        }
                      />
                      <Label htmlFor="is-active">Active</Label>
                    </div>
                    <Separator />
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button onClick={addWebService} className="flex-1">
                        Add Service
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="sm:block">
                <ModeToggle />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcwSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4 sm:mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!selectedServiceData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <Globe className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  Welcome to Byte Ping
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
                  {webServices.length === 0
                    ? "Add your first web service to start monitoring"
                    : "Select a service from the sidebar to view its analytics"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Service Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">
                    {selectedServiceData.webservice_name}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground truncate">
                    {selectedServiceData.webservice_url}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(selectedServiceData)}
                    className="text-xs sm:text-sm"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Configure</span>
                    <span className="sm:hidden">Config</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteWebService(selectedServiceData.id)}
                    className="text-xs sm:text-sm"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="sm:inline">Delete</span>
                    {/* <span className="sm:hidden">Del</span> */}
                  </Button>
                </div>
              </div>

              {serviceAnalytics && (
                <>
                  {/* Analytics Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                          Overall Uptime
                        </CardTitle>
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                          {serviceAnalytics.uptime}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {serviceAnalytics.totalChecks} total checks
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                          24h Uptime
                        </CardTitle>
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                          {serviceAnalytics.recentUptime}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {serviceAnalytics.recentChecks} recent checks
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                          Avg Response
                        </CardTitle>
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                          {serviceAnalytics.avgPing}ms
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Current: {currentStatus?.ping || 0}ms
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">
                          Incidents
                        </CardTitle>
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                          {serviceAnalytics.downtimeCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {serviceAnalytics.lastDowntime
                            ? `Last: ${serviceAnalytics.lastDowntime.toLocaleDateString()}`
                            : "No incidents"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {chartData.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                            Uptime Trend (7 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                              data={chartData}
                              margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 10,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                opacity={0.2}
                              />
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fill: "currentColor",
                                  fontSize: 11,
                                  opacity: 0.7,
                                }}
                              />
                              <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fill: "currentColor",
                                  fontSize: 11,
                                  opacity: 0.7,
                                }}
                              />
                              <Tooltip
                                formatter={(value) => [`${value}%`, "Uptime"]}
                                contentStyle={{
                                  backgroundColor: "var(--background)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                  color: "var(--foreground)",
                                  fontSize: "12px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="uptime"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                dot={{
                                  fill: "var(--chart-1)",
                                  strokeWidth: 2,
                                  stroke: "var(--background)",
                                  r: 4,
                                  fillOpacity: 1,
                                }}
                                activeDot={{
                                  r: 6,
                                  fill: "var(--chart-1)",
                                  strokeWidth: 2,
                                  stroke: "var(--background)",
                                  fillOpacity: 1,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                            Response Time (7 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                              data={chartData}
                              margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 10,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                opacity={0.2}
                              />
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fill: "currentColor",
                                  fontSize: 11,
                                  opacity: 0.7,
                                }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fill: "currentColor",
                                  fontSize: 11,
                                  opacity: 0.7,
                                }}
                              />
                              <Tooltip
                                formatter={(value) => [
                                  `${value}ms`,
                                  "Avg Response",
                                ]}
                                contentStyle={{
                                  backgroundColor: "var(--background)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                  color: "var(--foreground)",
                                  fontSize: "12px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="avgPing"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                dot={{
                                  fill: "var(--chart-2)",
                                  strokeWidth: 2,
                                  stroke: "var(--background)",
                                  r: 4,
                                  fillOpacity: 1,
                                }}
                                activeDot={{
                                  r: 6,
                                  fill: "var(--chart-2)",
                                  strokeWidth: 2,
                                  stroke: "var(--background)",
                                  fillOpacity: 1,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Service Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm sm:text-base">
                        Service Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Monitor Interval
                          </Label>
                          <p className="font-medium">
                            {selectedServiceData.monitor_interval} minutes
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Expected Status Code
                          </Label>
                          <p className="font-medium">
                            {selectedServiceData.expect_status_code}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Email Alerts
                          </Label>
                          <p className="font-medium">
                            {selectedServiceData.email_alert
                              ? "Enabled"
                              : "Disabled"}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <Label className="text-muted-foreground text-xs">
                            Monitoring Status
                          </Label>
                          <Badge
                            variant={
                              selectedServiceData.is_active
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1 w-fit"
                          >
                            {selectedServiceData.is_active
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Status History */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <CardTitle className="text-sm sm:text-base">
                          Recent Status History
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="text-xs sm:text-sm"
                        >
                          <Activity
                            className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${
                              isRefreshing ? "animate-spin" : ""
                            }`}
                          />
                          {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {(() => {
                        if (!selectedServiceId) {
                          return (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground">
                              <Eye className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No service selected</p>
                              <p className="text-xs sm:text-sm">
                                Select a service to view its status history
                              </p>
                            </div>
                          );
                        }

                        const statuses = webStatuses[selectedServiceId];

                        return statuses && statuses.length > 0 ? (
                          <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
                            {statuses.slice(0, 20).map((status, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 sm:p-3 rounded border text-sm"
                              >
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                  {status.status ? (
                                    <CheckCircle
                                      className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                                      style={{
                                        color: "var(--success-color)",
                                      }}
                                    />
                                  ) : (
                                    <XCircle
                                      className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"
                                      style={{
                                        color: "var(--destructive)",
                                      }}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium">
                                      {status.status ? "Online" : "Offline"}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                      {new Date(
                                        status.date_and_time
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs sm:text-sm font-medium">
                                    {status.ping}ms
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    Status: {status.status_code}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8 text-muted-foreground">
                            <Eye className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              No status history available
                            </p>
                            <p className="text-xs sm:text-sm">
                              Monitoring data will appear here once checks begin
                            </p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Edit Service Dialog */}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Edit Web Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Service Name</Label>
              <Input
                id="edit-name"
                value={formData.webservice_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    webservice_name: e.target.value,
                  })
                }
                placeholder="My Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={formData.webservice_url}
                onChange={(e) =>
                  setFormData({ ...formData, webservice_url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Monitor Interval (minutes)</Label>
              <Select
                value={formData.monitor_interval}
                onValueChange={(value) =>
                  setFormData({ ...formData, monitor_interval: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">25 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status-code">Expected Status Code</Label>
              <Input
                id="edit-status-code"
                value={formData.expect_status_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expect_status_code: e.target.value,
                  })
                }
                placeholder="200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-email-alert"
                checked={formData.email_alert}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, email_alert: Boolean(checked) })
                }
              />
              <Label htmlFor="edit-email-alert">Enable Email Alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: Boolean(checked) })
                }
              />
              <Label htmlFor="edit-is-active">Active</Label>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button onClick={updateWebService} className="flex-1">
                Update Service
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                  setSelectedService(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
