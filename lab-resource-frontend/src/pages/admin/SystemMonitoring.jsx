import { useQuery } from '@tanstack/react-query';
import {
  Activity, Database, Server, Clock, Cpu, HardDrive,
  CheckCircle, XCircle, Zap, Shield, Users, Calendar,
  Wrench, Beaker
} from 'lucide-react';
import { systemMonitorApi } from '../../api/api';

export default function SystemMonitoring() {
  const { data: health, isLoading, isError, error } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => { const res = await systemMonitorApi.getHealth(); return res.data; },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <XCircle size={48} className="mx-auto text-red-300 mb-3" />
        <p className="text-red-500">Failed to load system health</p>
        <p className="text-sm text-gray-400">{error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  const formatUptime = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const memoryPercentage = health?.totalMemoryMB > 0
    ? Math.round((health.usedMemoryMB / health.totalMemoryMB) * 100) : 0;

  const diskPercentage = health?.diskTotalGB > 0
    ? Math.round((health.diskUsedGB / health.diskTotalGB) * 100) : 0;

  const heapPercentage = health?.jvmHeapMaxMB > 0
    ? Math.round((health.jvmHeapUsedMB / health.jvmHeapMaxMB) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Monitoring</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${health?.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">Status: {health?.status}</span>
        </div>
      </div>

      {/* System Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Server size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.availableProcessors || 0}</p>
              <p className="text-sm text-gray-500">CPU Cores</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100 text-green-700">
              <HardDrive size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.totalMemoryMB || 0} MB</p>
              <p className="text-sm text-gray-500">Total Memory</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.usedMemoryMB || 0} MB</p>
              <p className="text-sm text-gray-500">Used Memory</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-100 text-yellow-700">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{formatUptime(health?.uptimeMs || 0)}</p>
              <p className="text-sm text-gray-500">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.totalUsers || 0}</p>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xs text-green-600">{health?.activeUsers || 0} active</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.totalBookings || 0}</p>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-xs text-blue-600">{health?.activeBookings || 0} active</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 text-orange-700">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.totalEquipment || 0}</p>
              <p className="text-sm text-gray-500">Total Equipment</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-100 text-pink-700">
              <Beaker size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.totalLabs || 0}</p>
              <p className="text-sm text-gray-500">Total Labs</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Metrics */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-8">API Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{(health?.totalApiRequests || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.avgResponseTimeMs || 0} ms</p>
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{health?.apiErrorCount || 0}</p>
              <p className="text-sm text-gray-500">API Errors (4xx/5xx)</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${(health?.apiErrorRate || 0) > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <Zap size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{(health?.apiErrorRate || 0).toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Error Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Memory Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Used: {health?.usedMemoryMB || 0} MB</span>
                <span className="text-gray-600">Free: {health?.freeMemoryMB || 0} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${memoryPercentage > 80 ? 'bg-red-500' : memoryPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${memoryPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{memoryPercentage}% utilized</p>
            </div>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Disk Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Used: {health?.diskUsedGB || 0} GB</span>
                <span className="text-gray-600">Free: {health?.diskFreeGB || 0} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${diskPercentage > 90 ? 'bg-red-500' : diskPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${diskPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{diskPercentage}% utilized of {health?.diskTotalGB || 0} GB total</p>
            </div>
          </div>
        </div>

        {/* JVM Heap Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">JVM Heap Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Used: {Math.round(health?.jvmHeapUsedMB || 0)} MB</span>
                <span className="text-gray-600">Max: {Math.round(health?.jvmHeapMaxMB || 0)} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${heapPercentage > 80 ? 'bg-red-500' : heapPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${heapPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{heapPercentage}% utilized</p>
            </div>
            <div className="text-sm text-gray-600">
              Non-Heap: {Math.round(health?.jvmNonHeapUsedMB || 0)} MB
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Status</h3>
          {health?.services ? (
            <div className="space-y-3">
              {Object.entries(health.services).map(([service, status]) => {
                const iconMap = { PostgreSQL: Database, Redis: Zap, Application: Server, 'JWT Auth': Shield };
                const Icon = iconMap[service] || Database;
                return (
                  <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-700">{service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'UP' ? (
                        <><CheckCircle size={16} className="text-green-500" /><span className="text-sm font-medium text-green-700">UP</span></>
                      ) : (
                        <><XCircle size={16} className="text-red-500" /><span className="text-sm font-medium text-red-700">{status}</span></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No service data</p>
          )}
        </div>
      </div>
    </div>
  );
}
