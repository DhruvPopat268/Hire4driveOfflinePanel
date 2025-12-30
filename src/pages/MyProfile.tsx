import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Edit2, Check, X, User, Users, Camera } from 'lucide-react';
import { Navbar } from '@/components/Sidebar';
import apiClient from '@/lib/axiosInterceptor';

const MyProfile = ({ onBack }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // 🔹 Fetch rider data on mount
  useEffect(() => {
    const fetchRider = async () => {
      try {
        const response = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/rider-auth/find-rider`);

        if (response.status === 200) {
          const rider = response.data.rider;

          // format "Member since"
          const createdAt = new Date(rider.createdAt);
          const memberSince = createdAt.toLocaleString('en-US', { month: 'long', year: 'numeric' });

          setUserProfile({
            name: rider.name,
            email: rider.email,
            mobile: rider.mobile,
            gender: rider.gender || '',
            memberSince,
            profilePhoto: rider.profilePhoto || null,
          });
          setPhotoPreview(rider.profilePhoto || null);
        } else {
          console.error('Failed to fetch rider');
        }
      } catch (error) {
        console.error('Error fetching rider:', error);
      }
    };

    fetchRider();
  }, []);

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(userProfile[field] || '');
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      alert('Field cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.put(`${import.meta.env.VITE_API_URL}/api/rider-auth/update`, {
        field: editingField,
        value: editValue,
      });

      if (response.status === 200) {
        setUserProfile((prev) => ({
          ...prev,
          [editingField]: editValue,
        }));

        setEditingField(null);
        setEditValue('');
      } else {
        alert(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSave = async () => {
    if (!profilePhotoFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('field', 'profilePhoto');
      formData.append('profilePhoto', profilePhotoFile);

      const response = await apiClient.put(`${import.meta.env.VITE_API_URL}/api/rider-auth/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setUserProfile((prev) => ({
          ...prev,
          profilePhoto: photoPreview,
        }));
        setProfilePhotoFile(null);
        alert('Profile photo updated successfully!');
      } else {
        alert(response.data.message || 'Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      alert('Error updating profile photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderEditableField = (field, icon, label, value) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-start py-3 border-b">
        <div className="flex items-center flex-1">
          {React.createElement(icon, { size: 18, className: "text-gray-400 mr-3 mt-1" })}
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">{label}</div>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  {field === 'gender' ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm text-gray-600 border rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                      autoFocus
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm text-gray-600 border rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-1.5 hover:bg-green-100 rounded-full text-green-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="p-1.5 hover:bg-red-100 rounded-full text-red-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">{value || 'Not specified'}</div>
            )}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => handleEdit(field)}
            className="p-1.5 hover:bg-gray-100 rounded-full ml-2 flex items-center justify-center"
          >
            <Edit2 size={16} className="text-gray-400" />
          </button>
        )}
      </div>
    );
  };

  if (!userProfile) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <Navbar title="My Profile"  />

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="text-center mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {userProfile.name?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            {profilePhotoFile && (
              <button
                onClick={handlePhotoSave}
                disabled={isLoading}
                className="mb-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Photo'}
              </button>
            )}
            <h3 className="text-xl font-semibold">{userProfile.name}</h3>
            <p className="text-gray-600">Member since {userProfile.memberSince}</p>
          </div>

          <div className="space-y-4">
            {renderEditableField('name', User, 'Name', userProfile.name)}
            {renderEditableField('email', Mail, 'Email', userProfile.email)}
            {renderEditableField('mobile', Phone, 'Mobile', userProfile.mobile)}
            {renderEditableField('gender', Users, 'Gender', userProfile.gender)}
          </div>
        </div>

        {/* Statistics section commented out */}
        {/*
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userProfile.totalRides}</div>
              <div className="text-sm text-gray-600">Total Rides</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{userProfile.rating}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
        */}

        {/* <div className="mt-4 space-y-2">
          <button className="w-full flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings size={18} className="mr-2" />
            Account Settings
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default MyProfile;