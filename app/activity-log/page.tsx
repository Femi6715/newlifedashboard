'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Search, Filter, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  table_name: string | null;
  record_id: number | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  username: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

interface ActivityLogResponse {
  activityLogs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    actions: string[];
    tableNames: string[];
    users: Array<{
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    }>;
  };
}

export default function ActivityLogPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    action: '__all__',
    tableName: '__all__',
    userId: '__all__',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filterOptions, setFilterOptions] = useState<{
    actions: string[];
    tableNames: string[];
    users: Array<{
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    }>;
  }>({
    actions: [],
    tableNames: [],
    users: []
  });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      // Build params, treat '__all__' as no filter
      const paramsObj: any = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
      };
      if (filters.action !== '__all__') paramsObj.action = filters.action;
      if (filters.tableName !== '__all__') paramsObj.table_name = filters.tableName;
      if (filters.userId !== '__all__') paramsObj.user_id = filters.userId;
      if (filters.startDate) paramsObj.start_date = filters.startDate;
      if (filters.endDate) paramsObj.end_date = filters.endDate;
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`/api/activity-log?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      const data: ActivityLogResponse = await response.json();
      setActivityLogs(data.activityLogs);
      setPagination(data.pagination);
      setFilterOptions(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchActivityLogs();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      action: '__all__',
      tableName: '__all__',
      userId: '__all__',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatAction = (action: string) => {
    const actionColors: { [key: string]: string } = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'LOGIN': 'bg-purple-100 text-purple-800',
      'LOGOUT': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={actionColors[action.toUpperCase()] || 'bg-gray-100 text-gray-800'}>
        {action}
      </Badge>
    );
  };

  const formatTableName = (tableName: string) => {
    const tableLabels: { [key: string]: string } = {
      'clients': 'Clients',
      'staff': 'Staff',
      'users': 'Users',
      'sessions': 'Sessions',
      'programs': 'Programs',
      'case_files': 'Case Files',
      'activity_log': 'Activity Log'
    };
    
    return tableLabels[tableName] || tableName;
  };

  const formatUserInfo = (log: ActivityLog) => {
    if (log.first_name && log.last_name) {
      return `${log.first_name} ${log.last_name}`;
    }
    if (log.username) {
      return log.username;
    }
    return 'System';
  };

  const formatJsonData = (data: any) => {
    if (!data) return 'N/A';
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Action', 'Table', 'Record ID', 'IP Address', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...activityLogs.map(log => [
        log.id,
        formatUserInfo(log),
        log.action,
        log.table_name || '',
        log.record_id || '',
        log.ip_address || '',
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && activityLogs.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activity logs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchActivityLogs} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Track all system activities and user actions
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">Total Activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filterOptions.users.length}</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filterOptions.actions.length}</div>
            <p className="text-xs text-muted-foreground">Action Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filterOptions.tableNames.length}</div>
            <p className="text-xs text-muted-foreground">Tables Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search actions, tables, IP..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All actions</SelectItem>
                  {filterOptions.actions.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Table</label>
              <Select value={filters.tableName} onValueChange={(value) => handleFilterChange('tableName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All tables</SelectItem>
                  {filterOptions.tableNames.map((table) => (
                    <SelectItem key={table} value={table}>{formatTableName(table)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={filters.userId} onValueChange={(value) => handleFilterChange('userId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All users</SelectItem>
                  {filterOptions.users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch}>Apply Filters</Button>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {activityLogs.length} of {pagination.total} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatUserInfo(log)}</div>
                        {log.role && (
                          <div className="text-xs text-muted-foreground">{log.role}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatAction(log.action)}</TableCell>
                    <TableCell>
                      {log.table_name ? formatTableName(log.table_name) : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.record_id || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip_address || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Activity Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about this activity
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Activity ID</label>
                                <p className="text-sm">{log.id}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">User</label>
                                <p className="text-sm">{formatUserInfo(log)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Action</label>
                                <p className="text-sm">{log.action}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Table</label>
                                <p className="text-sm">{log.table_name || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Record ID</label>
                                <p className="text-sm">{log.record_id || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">IP Address</label>
                                <p className="text-sm">{log.ip_address || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Created At</label>
                                <p className="text-sm">{format(new Date(log.created_at), 'PPP p')}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">User Role</label>
                                <p className="text-sm">{log.role || 'N/A'}</p>
                              </div>
                            </div>

                            {log.old_values && (
                              <>
                                <Separator />
                                <div>
                                  <label className="text-sm font-medium">Previous Values</label>
                                  <Textarea
                                    value={formatJsonData(log.old_values)}
                                    readOnly
                                    className="mt-2 font-mono text-xs"
                                    rows={4}
                                  />
                                </div>
                              </>
                            )}

                            {log.new_values && (
                              <>
                                <Separator />
                                <div>
                                  <label className="text-sm font-medium">New Values</label>
                                  <Textarea
                                    value={formatJsonData(log.new_values)}
                                    readOnly
                                    className="mt-2 font-mono text-xs"
                                    rows={4}
                                  />
                                </div>
                              </>
                            )}

                            {log.user_agent && (
                              <>
                                <Separator />
                                <div>
                                  <label className="text-sm font-medium">User Agent</label>
                                  <Textarea
                                    value={log.user_agent}
                                    readOnly
                                    className="mt-2 font-mono text-xs"
                                    rows={2}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 