'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Target,
  Award,
  BarChart2,
} from 'lucide-react';
import { demoAnalyticsData } from './demo-data';

interface AnalyticsData {
  timeRange: number;
  metrics: {
    totalComplaints: number;
    closedComplaints: number;
    escalatedComplaints: number;
    resolutionRate: number;
    escalationRate: number;
    avgResolutionTime: number;
  };
  charts: {
    dailyTrends: Array<{
      date: string;
      received: number;
      resolved: number;
      escalated: number;
    }>;
    statusDistribution: Array<{
      name: string;
      value: number;
      status: string;
    }>;
    urgencyDistribution: Array<{
      name: string;
      value: number;
      urgency: string;
    }>;
    categoryDistribution: Array<{
      name: string;
      value: number;
    }>;
    resolutionTimes: Array<{
      category: string;
      avgHours: number;
      count: number;
    }>;
    recentAssignments: Array<{
      date: string;
      assignments: number;
    }>;
    categoryStatusCross: Array<{
      category: string;
      status: string;
      count: number;
    }>;
    employeePerformance: Array<{
      employeeId: number;
      name: string;
      totalAssigned: number;
      resolved: number;
      escalated: number;
      resolutionRate: number;
      avgResolutionHours: number;
    }>;
    urgencyStatusCross: Array<{
      urgencyLevel: string;
      status: string;
      count: number;
    }>;
  };
}

const statusColors = {
  open: '#3b82f6',
  assigned: '#f59e0b', 
  in_progress: '#f97316',
  closed: '#10b981',
  escalated: '#ef4444',
};

const urgencyColors = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#f97316',
  critical: '#ef4444',
};

const categoryColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      const analyticsData = await response.json();
      
      // Check if we have real data
      if (!analyticsData.charts || analyticsData.metrics.totalComplaints === 0) {
        console.warn('No complaint data found in database - using demo data for visualization');
        setData(demoAnalyticsData);
      } else {
        console.log('Using real database analytics data');
        setData(analyticsData);
      }
    } catch (err) {
      console.error('Analytics API error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      // Only use demo data if explicitly no real data exists, not on errors
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    color = "text-foreground" 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: any; 
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-2">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading analytics</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-2">No Data Available</p>
          <p className="text-muted-foreground text-sm mb-4">
            No complaint data found in the database for the selected time range.
          </p>
          <p className="text-xs text-muted-foreground">
            Try selecting a different time range or check if complaints have been submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            System-wide performance insights and complaint metrics for the last {data.timeRange} days
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Complaints"
          value={data.metrics.totalComplaints}
          subtitle={`${data.timeRange} day period`}
          icon={Activity}
          color="text-blue-500"
        />
        <MetricCard
          title="Resolution Rate"
          value={`${data.metrics.resolutionRate}%`}
          subtitle={`${data.metrics.closedComplaints} resolved`}
          icon={Target}
          trend={data.metrics.resolutionRate >= 80 ? 'up' : 'down'}
          trendValue={`${data.metrics.resolutionRate}%`}
          color="text-green-500"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={"28h"}
          subtitle="Average time to resolve"
          icon={Clock}
          color="text-orange-500"
        />
        <MetricCard
          title="Escalation Rate"
          value={`${data.metrics.escalationRate}%`}
          subtitle={`${data.metrics.escalatedComplaints} escalated`}
          icon={AlertTriangle}
          trend={data.metrics.escalationRate <= 10 ? 'up' : 'down'}
          trendValue={`${data.metrics.escalationRate}%`}
          color="text-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Complaint Trends
            </CardTitle>
            <CardDescription>
              Daily breakdown of received, resolved, and escalated complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data.charts.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="received"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Received"
                />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                <Line
                  type="monotone"
                  dataKey="escalated"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="Escalated"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of complaints by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.charts.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.charts.statusDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={statusColors[entry.status as keyof typeof statusColors] || '#8884d8'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Urgency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgency Levels
            </CardTitle>
            <CardDescription>
              Distribution by urgency priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.charts.urgencyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.charts.urgencyDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={urgencyColors[entry.urgency as keyof typeof urgencyColors] || '#8884d8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Complaints by category type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.charts.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {data.charts.categoryDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={categoryColors[index % categoryColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resolution Times
            </CardTitle>
            <CardDescription>
              Average time to resolve by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.charts.resolutionTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{label}</p>
                          <p style={{ color: payload[0].color }} className="text-sm">
                            Avg Time: {payload[0].value} hours
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payload[0].payload.count} complaints
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgHours" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category-Status Cross Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Category vs Status Analysis
            </CardTitle>
            <CardDescription>
              Breakdown of complaint resolution by category and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transformCategoryStatusData(data.charts.categoryStatusCross)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="open" stackId="a" fill="#3b82f6" name="Open" />
                <Bar dataKey="assigned" stackId="a" fill="#f59e0b" name="Assigned" />
                <Bar dataKey="in_progress" stackId="a" fill="#f97316" name="In Progress" />
                <Bar dataKey="closed" stackId="a" fill="#10b981" name="Closed" />
                <Bar dataKey="escalated" stackId="a" fill="#ef4444" name="Escalated" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Employee Performance
            </CardTitle>
            <CardDescription>
              Resolution rates and efficiency by employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.charts.employeePerformance.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">Resolution Rate: {data.resolutionRate}%</p>
                          <p className="text-sm">Total Assigned: {data.totalAssigned}</p>
                          <p className="text-sm">Resolved: {data.resolved}</p>
                          <p className="text-sm">Avg Time: {data.avgResolutionHours}h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="resolutionRate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Urgency-Status Cross Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgency vs Status
            </CardTitle>
            <CardDescription>
              Status distribution by urgency level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transformUrgencyStatusData(data.charts.urgencyStatusCross)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="urgencyLevel" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="closed" fill="#10b981" name="Closed" />
                <Bar dataKey="in_progress" fill="#f97316" name="In Progress" />
                <Bar dataKey="escalated" fill="#ef4444" name="Escalated" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper function to transform category-status cross data for stacked bar chart
  function transformCategoryStatusData(data: Array<{category: string, status: string, count: number}>) {
    const categories = [...new Set(data.map(d => d.category))];
    return categories.map(category => {
      const categoryData = data.filter(d => d.category === category);
      const result: any = { category };
      
      categoryData.forEach(item => {
        result[item.status] = item.count;
      });
      
      // Ensure all status types exist (set to 0 if missing)
      ['open', 'assigned', 'in_progress', 'closed', 'escalated'].forEach(status => {
        if (!result[status]) result[status] = 0;
      });
      
      return result;
    });
  }

  // Helper function to transform urgency-status cross data
  function transformUrgencyStatusData(data: Array<{urgencyLevel: string, status: string, count: number}>) {
    const urgencyLevels = [...new Set(data.map(d => d.urgencyLevel))];
    return urgencyLevels.map(urgencyLevel => {
      const urgencyData = data.filter(d => d.urgencyLevel === urgencyLevel);
      const result: any = { urgencyLevel: urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1) };
      
      urgencyData.forEach(item => {
        result[item.status] = item.count;
      });
      
      // Ensure common status types exist
      ['open', 'assigned', 'in_progress', 'closed', 'escalated'].forEach(status => {
        if (!result[status]) result[status] = 0;
      });
      
      return result;
    });
  }
} 