import React from 'react';
import { useDashboard } from '@/hooks/useDatabase';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Database, FileText, Clock } from 'lucide-react';
import { formatTimestamp } from '@/utils/database';

interface DashboardProps {
  connectionId: number;
}

const Dashboard: React.FC<DashboardProps> = ({ connectionId }) => {
  const { stats, activityLogs, isLoadingTables, isLoadingActivityLogs } = useDashboard(connectionId);

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Database Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Total Tables
                  </dt>
                  <dd>
                    {isLoadingTables ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-neutral-500">Loading...</span>
                      </div>
                    ) : (
                      <div className="text-lg font-medium text-neutral-900">
                        {stats.totalTables}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Database Size
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">
                      {stats.databaseSize}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    Total Rows
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">
                      {stats.totalRows.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-neutral-700 mb-4">Recent Activity</h2>
        <Card>
          {isLoadingActivityLogs ? (
            <CardContent className="p-4 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading activity logs...</span>
            </CardContent>
          ) : (
            <div>
              {activityLogs && activityLogs.length > 0 ? (
                <ul className="divide-y divide-neutral-200">
                  {activityLogs.map((log) => (
                    <li key={log.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary truncate">
                            <span>{log.operation}</span> operation on <span>{log.tableId ? `table ID ${log.tableId}` : 'database'}</span>
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'SUCCESS' ? 'bg-success bg-opacity-10 text-success' : 'bg-error bg-opacity-10 text-error'}`}>
                              {log.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-neutral-500">
                              {log.details || 'No details provided'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                            <p>
                              <time dateTime={log.createdAt}>
                                {formatTimestamp(log.createdAt)}
                              </time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <CardContent className="p-4 text-center text-neutral-500">
                  No activity logs found.
                </CardContent>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
