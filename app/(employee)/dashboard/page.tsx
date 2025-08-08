'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ClockIcon, UserIcon, SearchIcon, AlertTriangleIcon, CheckCircleIcon, Clock, AlertCircleIcon, BarChart3, List } from "lucide-react"
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard"
import { demoComplaints } from "@/components/dashboard/demo-data"

interface Complaint {
  id: string;
  referenceNumber: string | null;
  description: string | null;
  additionalDetails: string | null;
  category: string | null;
  subCategory: string | null;
  urgencyLevel: string | null;
  status: string | null;
  assignedTo: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  resolvedAt: Date | null;
  customerId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
}

const statusColors = {
  'open': 'bg-blue-100 text-blue-800 border-blue-200',
  'assigned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in_progress': 'bg-orange-100 text-orange-800 border-orange-200',
  'closed': 'bg-green-100 text-green-800 border-green-200',
  'escalated': 'bg-red-100 text-red-800 border-red-200'
};

const urgencyColors = {
  'low': 'bg-gray-100 text-gray-800 border-gray-200',
  'medium': 'bg-blue-100 text-blue-800 border-blue-200',
  'high': 'bg-orange-100 text-orange-800 border-orange-200',
  'critical': 'bg-red-100 text-red-800 border-red-200'
};

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open':
      return <AlertCircleIcon className="w-4 h-4" />;
    case 'assigned':
      return <Clock className="w-4 h-4" />;
    case 'in_progress':
      return <Clock className="w-4 h-4" />;
    case 'closed':
      return <CheckCircleIcon className="w-4 h-4" />;
    case 'escalated':
      return <AlertTriangleIcon className="w-4 h-4" />;
    default:
      return <AlertCircleIcon className="w-4 h-4" />;
  }
};

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [openingWorkspace, setOpeningWorkspace] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/complaints?status=${statusFilter}`);
      if (!response.ok) {
        // Use demo data if API fails
        console.warn('Using demo complaints data');
        setComplaints(demoComplaints.filter(c => statusFilter === 'all' || c.status === statusFilter));
        return;
      }
      const data = await response.json();
      
      // If no real data, use demo data
      if (!data.complaints || data.complaints.length === 0) {
        setComplaints(demoComplaints.filter(c => statusFilter === 'all' || c.status === statusFilter));
      } else {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.warn('API failed, using demo complaints:', err);
      setComplaints(demoComplaints.filter(c => statusFilter === 'all' || c.status === statusFilter));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkspace = async (complaint: Complaint) => {
    try {
      setOpeningWorkspace(complaint.id);
      router.push(`/workspace/${complaint.referenceNumber}`);
    } catch (err) {
      console.error('Error opening workspace:', err);
      setError(err instanceof Error ? err.message : 'Failed to open workspace');
    } finally {
      setOpeningWorkspace(null);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      (complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (complaint.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (complaint.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesSearch;
  });

  const getStatusCount = (status: string) => {
    return complaints.filter(complaint => complaint.status === status).length;
  };

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  // Redirect if not authenticated or not an employee
  if (status === 'unauthenticated' || !session?.user || session.user.type !== 'employee') {
    return (
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">Authentication Required</p>
            <p className="text-muted-foreground text-sm">Please log in as an employee to access the dashboard.</p>
            <Button onClick={() => router.push('/login/employee')} className="mt-4">Login</Button>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (loading) {
    return (
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangleIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">Error loading complaints</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button onClick={fetchComplaints} className="mt-4">Retry</Button>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Complaints Dashboard</h1>
                <p className="text-muted-foreground">Manage complaints and view analytics insights</p>
              </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {complaints.length} Total Complaints
              </Badge>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              My Complaints
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="complaints" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Open</span>
                </div>
                <p className="text-2xl font-bold">{getStatusCount('open')}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Assigned</span>
                </div>
                <p className="text-2xl font-bold">{getStatusCount('assigned')}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <p className="text-2xl font-bold">{getStatusCount('in_progress')}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Closed</span>
                </div>
                <p className="text-2xl font-bold">{getStatusCount('closed')}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Escalated</span>
                </div>
                <p className="text-2xl font-bold">{getStatusCount('escalated')}</p>
              </Card>
            </div>
            
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Complaints Grid */}
            <div className="grid gap-6">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary/60">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Header with title and badges */}
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {complaint.description || 'No description available'}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {complaint.status && (
                              <Badge variant="secondary" className="text-xs font-medium">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(complaint.status)}
                                  {complaint.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            )}
                            {complaint.urgencyLevel && (
                              <Badge variant="outline" className="text-xs font-medium">
                                {complaint.urgencyLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Reference number and action */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1.5 rounded-full border">
                            {complaint.referenceNumber || complaint.id.substring(0, 8)}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={() => handleOpenWorkspace(complaint)}
                            disabled={openingWorkspace === complaint.id}
                          >
                            {openingWorkspace === complaint.id ? 'Opening...' : 'Open Workspace'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Key information grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <UserIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Customer</div>
                          <div className="truncate font-medium">{complaint.customerName || 'Unknown'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <CalendarIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Created</div>
                          <div className="truncate font-medium">{formatDate(complaint.createdAt)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <ClockIcon className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Updated</div>
                          <div className="truncate font-medium">{complaint.updatedAt ? getTimeAgo(complaint.updatedAt) : 'Never'}</div>
                        </div>
                      </div>
                      
                      {complaint.category && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20 hover:bg-muted/30 transition-colors">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <div className="w-4 h-4 text-purple-500">📂</div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Category</div>
                            <div className="truncate font-medium">
                              {complaint.category}
                              {complaint.subCategory && ` > ${complaint.subCategory}`}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Resolution status */}
                    {complaint.resolvedAt && (
                      <div className="mt-6 flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-green-800">Resolved</div>
                          <div className="text-xs text-green-600 font-medium">{formatDate(complaint.resolvedAt)}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">No complaints found</div>
                <p className="text-sm text-muted-foreground">
                  {complaints.length === 0 ? 
                    'You have no assigned complaints at the moment.' : 
                    'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
