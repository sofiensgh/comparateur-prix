// app/components/OrderHistory.tsx
'use client';

import { useState } from 'react';
import { FaShoppingCart, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  total: number;
  itemsList: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderHistoryProps {
  preview?: boolean;
  limit?: number;
}

export default function OrderHistory({ preview = false, limit = 5 }: OrderHistoryProps) {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      items: 3,
      total: 149.99,
      itemsList: [
        { name: 'Wireless Headphones', quantity: 1, price: 89.99 },
        { name: 'Phone Case', quantity: 2, price: 30.00 },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-01-10',
      status: 'shipped',
      items: 2,
      total: 74.50,
      itemsList: [
        { name: 'Laptop Stand', quantity: 1, price: 49.99 },
        { name: 'USB Cable', quantity: 1, price: 24.51 },
      ],
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: '2024-01-05',
      status: 'processing',
      items: 1,
      total: 29.99,
      itemsList: [
        { name: 'Mouse Pad', quantity: 1, price: 29.99 },
      ],
    },
    {
      id: '4',
      orderNumber: 'ORD-2023-156',
      date: '2023-12-20',
      status: 'cancelled',
      items: 4,
      total: 199.99,
      itemsList: [
        { name: 'Keyboard', quantity: 1, price: 79.99 },
        { name: 'Mouse', quantity: 1, price: 49.99 },
        { name: 'Webcam', quantity: 1, price: 69.99 },
      ],
    },
  ]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <FaShoppingCart className="text-yellow-500" />;
      case 'shipped':
        return <FaShippingFast className="text-blue-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const displayedOrders = preview ? orders.slice(0, limit) : orders;

  return (
    <div className="space-y-4">
      {preview && orders.length === 0 ? (
        <div className="text-center py-8">
          <FaShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No orders yet</h4>
          <p className="text-gray-600">Start shopping to see your orders here</p>
        </div>
      ) : (
        <>
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">Order #{order.orderNumber}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {formatDate(order.date)} • {order.items} item{order.items !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">{formatCurrency(order.total)}</p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                    View Details
                  </button>
                </div>
              </div>

              {!preview && (
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Items:</h5>
                  <div className="space-y-2">
                    {order.itemsList.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  Track Order
                </button>
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                  Reorder
                </button>
                {order.status === 'delivered' && (
                  <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}

          {preview && orders.length > limit && (
            <div className="text-center pt-4">
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View All Orders ({orders.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}