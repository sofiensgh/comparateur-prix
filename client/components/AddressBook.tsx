// app/components/AddressBook.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaCheck, FaTimes } from 'react-icons/fa';

interface Address {
  id: string;
  title: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressBookProps {
  userId: string;
}

export default function AddressBook({ userId }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false,
  });

  // Load addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAddresses: Address[] = [
        {
          id: '1',
          title: 'Home',
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          phone: '+1 (555) 123-4567',
          isDefault: true,
        },
        {
          id: '2',
          title: 'Office',
          fullName: 'John Doe',
          street: '456 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          phone: '+1 (555) 987-6543',
          isDefault: false,
        },
      ];
      
      setAddresses(mockAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveAddress = async () => {
    // Save address logic here
    console.log('Saving address:', formData);
    
    // Mock save - replace with actual API call
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } as Address : addr
      ));
    } else {
      // Add new address
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    
    // Reset form
    setFormData({
      title: '',
      fullName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false,
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      // Delete address logic here
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  const handleSetDefault = async (addressId: string) => {
    // Set as default address
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAddress(null);
            setFormData({
              title: '',
              fullName: '',
              street: '',
              city: '',
              state: '',
              zipCode: '',
              phone: '',
              isDefault: addresses.length === 0,
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
                setFormData({
                  title: '',
                  fullName: '',
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  phone: '',
                  isDefault: false,
                });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Home, Office"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Recipient's full name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ZIP code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSaveAddress}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaCheck /> Save Address
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`border rounded-xl p-4 ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className={`${address.isDefault ? 'text-blue-600' : 'text-gray-400'}`} />
                <h5 className="font-semibold text-gray-800">{address.title}</h5>
                {address.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-800">{address.fullName}</p>
              <p className="text-gray-600">{address.street}</p>
              <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
              <p className="text-gray-600">{address.phone}</p>
            </div>
            
            {!address.isDefault && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Set as default
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {addresses.length === 0 && !showAddForm && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <FaMapMarkerAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No addresses saved</h4>
          <p className="text-gray-600 mb-4">Add your first address to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Address
          </button>
        </div>
      )}
    </div>
  );
}