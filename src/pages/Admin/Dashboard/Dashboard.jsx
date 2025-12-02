import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import dashboardService from '../../../services/dashboardService'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateFilter, setDateFilter] = useState('Today')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getAdminDashboard()
      setDashboardData(data)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Sent messages',
      value: dashboardData?.statistics?.totalMessagesSent || 0,
      trend: '+6.32%',
      trendUp: true,
      trendLabel: 'Up from last week',
      icon: (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Total Users',
      value: dashboardData?.statistics?.totalUsers || 0,
      trend: '+6.32%',
      trendUp: true,
      trendLabel: 'Up from last week',
      icon: (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Failed Messages',
      value: dashboardData?.statistics?.failedMessages || 0,
      trend: '-6.32%',
      trendUp: false,
      trendLabel: 'Up from last month',
      icon: (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
  ]

  const planData = [
    { name: 'Plan 1', value: 1658.90, trend: 'up' },
    { name: 'Plan 2', value: 369.90, trend: 'stable' },
    { name: 'Plan 3', value: 1658.90, trend: 'up' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome to <span className="text-[#1FAF6E]">WA Sender</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track the delivery status of your WhatsApp messages
            </p>
          </div>
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none bg-[#1FAF6E] text-white px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
            <svg className="w-4 h-4 text-white absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FAF6E]"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trendUp ? '↑' : '↓'} {card.trend}
                    </span>
                    <span className="text-sm text-gray-500">{card.trendLabel}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Analytics and Plan Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Messages Analytics Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Messages Analytics</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#1FAF6E]"></div>
                      <span className="text-sm text-gray-500">Line One</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-sm text-gray-500">Line Two</span>
                    </div>
                  </div>
                </div>
                
                {/* Simple Line Chart Visualization */}
                <div className="relative h-64">
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 50, 100, 150, 200].map((y, i) => (
                      <line key={i} x1="0" y1={y} x2="400" y2={y} stroke="#f0f0f0" strokeWidth="1" />
                    ))}
                    
                    {/* Line One (Green) */}
                    <path
                      d="M 0 150 Q 50 120, 100 100 T 200 80 T 300 60 T 400 40"
                      fill="none"
                      stroke="#1FAF6E"
                      strokeWidth="2"
                    />
                    <path
                      d="M 0 150 Q 50 120, 100 100 T 200 80 T 300 60 T 400 40 L 400 200 L 0 200 Z"
                      fill="url(#greenGradient)"
                      opacity="0.2"
                    />
                    
                    {/* Line Two (Blue) */}
                    <path
                      d="M 0 180 Q 50 160, 100 140 T 200 120 T 300 100 T 400 80"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />
                    <path
                      d="M 0 180 Q 50 160, 100 140 T 200 120 T 300 100 T 400 80 L 400 200 L 0 200 Z"
                      fill="url(#blueGradient)"
                      opacity="0.2"
                    />
                    
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1FAF6E" />
                        <stop offset="100%" stopColor="#1FAF6E" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
                    <span>2400</span>
                    <span>1800</span>
                    <span>1200</span>
                    <span>600</span>
                    <span>0</span>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-400 -mb-6">
                    <span>Aug 30</span>
                    <span>Sep 05</span>
                    <span>Sep 15</span>
                    <span>Oct 26</span>
                  </div>
                </div>
              </motion.div>

              {/* Plan Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Plan Status</h2>
                  <button className="text-sm text-gray-500 hover:text-gray-700">View all</button>
                </div>
                
                <div className="space-y-4">
                  {planData.map((plan, index) => (
                    <div key={plan.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{plan.name}</span>
                      <div className="flex items-center gap-3">
                        {/* Mini trend chart */}
                        <svg className="w-16 h-6" viewBox="0 0 60 24">
                          <path
                            d={plan.trend === 'up' 
                              ? "M 0 20 Q 15 15, 30 10 T 60 5"
                              : plan.trend === 'stable'
                              ? "M 0 12 Q 15 14, 30 12 T 60 14"
                              : "M 0 5 Q 15 10, 30 15 T 60 20"
                            }
                            fill="none"
                            stroke={plan.trend === 'up' ? '#1FAF6E' : plan.trend === 'stable' ? '#f59e0b' : '#ef4444'}
                            strokeWidth="2"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 min-w-[70px] text-right">
                          {plan.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Subscriptions */}
            {dashboardData?.recentSubscriptions && dashboardData.recentSubscriptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscriptions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">User</th>
                        <th className="pb-3 font-medium">Package</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Messages Used</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentSubscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{sub.user?.name}</p>
                              <p className="text-xs text-gray-500">{sub.user?.email}</p>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-700">{sub.package?.name}</td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              sub.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-700' 
                                : sub.status === 'EXPIRED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-700">
                            {sub.messagesUsed} / {sub.messagesRemaining + sub.messagesUsed}
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default Dashboard











