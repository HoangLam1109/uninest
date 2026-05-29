import { Card, CardContent } from '@/components/ui/card'
import { LandlordLayout } from '@/components/landlord/LandlordLayout'
import { LogoutButton } from '@/components/auth/LogoutButton'

interface StatItem {
  label: string
  value: string
  change: string
  isNegative?: boolean
}

interface Transaction {
  id: string
  name: string
  room: string
  date: string
  amount: string
  status: 'Thành công' | 'Đang chờ' | 'Quá hạn'
}

export function DashboardPage() {
  const stats: StatItem[] = [
    {
      label: 'Doanh thu tháng này',
      value: '125.000.000đ',
      change: '+28%',
    },
    {
      label: 'Phòng đang trống',
      value: '05/50',
      change: '-11%',
      isNegative: true,
    },
    {
      label: 'Khách thuê mới',
      value: '12',
      change: '+4',
    },
    {
      label: 'Sự cố lỗi thuật',
      value: '02',
      change: 'Cần xử lý',
      isNegative: true,
    },
  ]

  const transactions: Transaction[] = [
    {
      id: '1',
      name: 'Nguyễn Văn An',
      room: 'P.102',
      date: '12/06/2024',
      amount: '4.500.000đ',
      status: 'Thành công',
    },
    {
      id: '2',
      name: 'Lê Thị Trinh',
      room: 'P.305',
      date: '11/06/2024',
      amount: '5.200.000đ',
      status: 'Đang chờ',
    },
    {
      id: '3',
      name: 'Trần Minh Hoàng',
      room: 'P.201',
      date: '10/06/2024',
      amount: '4.800.000đ',
      status: 'Thành công',
    },
    {
      id: '4',
      name: 'Phạm Mai Hương',
      room: 'P.410',
      date: '09/06/2024',
      amount: '3.900.000đ',
      status: 'Quá hạn',
    },
  ]

  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Thành công':
        return 'bg-green-100 text-green-800'
      case 'Đang chờ':
        return 'bg-yellow-100 text-yellow-800'
      case 'Quá hạn':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <LandlordLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chào buổi sáng, Admin!</h1>
              <p className="text-gray-600 mt-1">Hôm nay có 3 khoản thanh toán mới cần duyệt.</p>
            </div>
            <div className="w-32">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="flex flex-col justify-between h-full">
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p
                      className={`text-sm font-semibold mt-2 ${
                        stat.isNegative ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Doanh thu 6 tháng gần nhất</h2>
                  <select className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1">
                    <option>Năm 2024</option>
                  </select>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between h-64 gap-2 p-4 bg-gray-50 rounded-lg">
                  {months.map((month, index) => {
                    const heights = [40, 50, 35, 60, 45, 75]
                    return (
                      <div key={month} className="flex flex-col items-center flex-1 gap-2">
                        <div
                        className="w-full bg-linear-to-t from-orange-400 to-orange-300 rounded-t-lg"
                          style={{ height: `${heights[index]}%` }}
                        />
                        <span className="text-xs text-gray-600">{month}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Expense Chart */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Tiêu thu Điện & Nước</h2>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-orange-400" />
                      Điện
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-blue-300" />
                      Nước
                    </span>
                  </div>
                </div>

                {/* Simple Line Chart */}
                <div className="h-48 flex items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                    {/* Grid */}
                    <line x1="0" y1="30" x2="300" y2="30" stroke="#f0f0f0" strokeWidth="1" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#f0f0f0" strokeWidth="1" />
                    <line x1="0" y1="120" x2="300" y2="120" stroke="#f0f0f0" strokeWidth="1" />

                    {/* Orange line */}
                    <polyline
                      points="10,100 60,60 110,80 160,40 210,70 260,30"
                      fill="none"
                      stroke="#fb923c"
                      strokeWidth="3"
                    />

                    {/* Blue line */}
                    <polyline
                      points="10,110 60,85 110,95 160,65 210,85 260,55"
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Tổng phí điện</p>
                    <p className="font-bold text-gray-900">12.450.000đ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng phí nước</p>
                    <p className="font-bold text-gray-900">3.200.000đ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Thanh toán gần đây</h2>
                <a href="#" className="text-orange-500 text-sm font-semibold hover:text-orange-600">
                  Xem tất cả
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        NGƯỜI THUÊ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        SỐ PHÒNG
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        NGÀY THANH TOÁN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        SỐ TIỀN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        TRẠNG THÁI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        HÀNH ĐỘNG
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300" />
                          <span className="font-medium text-gray-900">{transaction.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{transaction.room}</td>
                        <td className="px-6 py-4 text-gray-600">{transaction.date}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{transaction.amount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              transaction.status,
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.5 1.5H9.5V3H4V4H3V5H17V4H16V3H10.5V1.5Z" />
                              <path d="M3 5V17C3 18.1046 3.89543 19 5 19H15C16.1046 19 17 18.1046 17 17V5H3Z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LandlordLayout>
  )
}
