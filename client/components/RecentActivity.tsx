// components/RecentActivity.tsx
'use client';

import { FaUserPlus, FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaComment } from 'react-icons/fa';

interface Activity {
  id: string;
  type: 'user' | 'order' | 'alert' | 'success' | 'comment';
  title: string;
  description: string;
  time: string;
  user?: string;
}

export default function RecentActivity() {
  const activities: Activity[] = [
    { id: '1', type: 'user', title: 'New user registered', description: 'John Doe created an account', time: '10 min ago', user: 'john@example.com' },
    { id: '2', type: 'order', title: 'New order placed', description: 'Order #ORD-78950 for $349.99', time: '25 min ago' },
    { id: '3', type: 'alert', title: 'Low stock alert', description: 'Product "Wireless Headphones" is low in stock', time: '1 hour ago' },
    { id: '4', type: 'success', title: 'Payment processed', description: 'Payment for order #ORD-78945 completed', time: '2 hours ago' },
    { id: '5', type: 'comment', title: 'New review', description: 'Customer left a 5-star review for "Smart Watch"', time: '3 hours ago' },
    { id: '6', type: 'order', title: 'Order shipped', description: 'Order #ORD-78946 has been shipped', time: '5 hours ago' },
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user': return <FaUserPlus className="text-blue-500" />;
      case 'order': return <FaShoppingCart className="text-green-500" />;
      case 'alert': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'success': return <FaCheckCircle className="text-purple-500" />;
      case 'comment': return <FaComment className="text-indigo-500" />;
      default: return <FaCheckCircle className="text-gray-500" />;
    }
  };

  const getBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'user': return 'bg-blue-50';
      case 'order': return 'bg-green-50';
      case 'alert': return 'bg-yellow-50';
      case 'success': return 'bg-purple-50';
      case 'comment': return 'bg-indigo-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className={`p-4 rounded-lg ${getBgColor(activity.type)} border-l-4 ${
              activity.type === 'user' ? 'border-blue-400' :
              activity.type === 'order' ? 'border-green-400' :
              activity.type === 'alert' ? 'border-yellow-400' :
              activity.type === 'success' ? 'border-purple-400' :
              'border-indigo-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-1">{activity.user}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-center">
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            Load More Activity
          </button>
        </div>
      </div>
    </div>
  );
}