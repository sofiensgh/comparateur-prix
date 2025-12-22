// components/AdminStatsCard.tsx - Updated
'use client';

interface AdminStatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  isLoading?: boolean;
  subText?: string;
}

export default function AdminStatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  isLoading = false,
  subText = ''
}: AdminStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
  };

  const textColorClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
  };

  const isPositive = change.startsWith('+');

  return (
    <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="space-y-2 mt-2">
              <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse"></div>
              {subText && (
                <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
              )}
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold mt-2">{value}</p>
              {subText && (
                <p className="text-sm text-gray-600 mt-1">{subText}</p>
              )}
            </>
          )}
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-gray-500 text-sm ml-2">from last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${bgColorClasses[color]}`}>
          <div className={`${textColorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t">
        {isLoading ? (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full bg-gray-300 animate-pulse w-1/2"></div>
          </div>
        ) : (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${colorClasses[color]}`}
              style={{ width: isPositive ? '75%' : '45%' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}