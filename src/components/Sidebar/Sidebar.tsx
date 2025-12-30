import React, { useState, useEffect } from 'react';
import { X, Clock, User, LogOut, Trash2, Bike, AlertTriangle, House, LogIn , Gift , Wallet, Play} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ onNavigate }) => {
  const {
    isOpen, closeSidebar, showLogoutDialog, setShowLogoutDialog,
    showDeleteDialog, setShowDeleteDialog
  } = useSidebar();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [initials, setInitials] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/offline-staff/find-staff`,
          {
            withCredentials: true
          }
        );

        if (res.data?.success && res.data.staff) {
          const staff = res.data.staff;
          setIsLoggedIn(true);

          setName(staff.name || staff.email || "");
          setMobile(staff.email || "");

          // Generate initials from name or email
          if (staff.name) {
            const words = staff.name.trim().split(" ");
            if (words.length >= 2) {
              setInitials(
                words[0][0].toUpperCase() + words[1][0].toUpperCase()
              );
            } else {
              setInitials(words[0][0].toUpperCase());
            }
          } else if (staff.email) {
            setInitials(staff.email[0].toUpperCase());
          }
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
        if (err.response?.status === 401) {
          setIsLoggedIn(false);
        }
      }
    };

    fetchStaff();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/offline-staff/logout`, {
        method: "POST",
        credentials: 'include'
      });
      
      // Clear localStorage and update state
      localStorage.clear();
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API fails, clear local state
      localStorage.clear();
      setIsLoggedIn(false);
      navigate('/');
    }
  };
  const deleteRider = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rider-auth/delete-rider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (res.status === 200) {
        // Clear localStorage and update state
        localStorage.clear();
        setIsLoggedIn(false);
        navigate("/");
      } else {
        const data = await res.json();
        console.error("Failed to delete rider:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting rider:", error);
    }
  };

  const userProfile = {
    name,
    initials,
  };

  const handleNavigation = (path, label) => {
    if (onNavigate) {
      onNavigate(path, label);
    } else {
      // Fallback for window navigation
      window.location.href = path;
    }
    closeSidebar();
  };

  const handleLoginClick = () => {
    closeSidebar();
    navigate('/');
  };

const menuItems = [
  {
    icon: House,
    label: 'Search Rider',
    onClick: () => {
      handleNavigation('/search-rider', 'Search Rider');
      window.location.reload();
    }
  },
  {
    icon: Clock,
    label: 'Current Rides',
    onClick: () => {
      handleNavigation('/currentBookings', 'Current Bookings');
      window.location.reload();
    }
  },

  {
    icon: Play,
    label: 'Ongoing Rides',
    onClick: () => {
      handleNavigation('/ongoingRides', 'Ongoing Rides');
      window.location.reload();
    }
  },
  {
    icon: Bike,
    label: 'Past Rides',
    onClick: () => {
      handleNavigation('/pastRides', 'Past Rides');
      window.location.reload();
    }
  },
  {
    icon: LogOut,
    label: 'Logout',
    onClick: () => setShowLogoutDialog(true),
    className: 'text-orange-600 hover:bg-orange-50'
  }
];

  const loginButton = {
    icon: LogIn,
    label: 'Login',
    onClick: handleLoginClick,
    className: 'text-blue-600 hover:bg-blue-50'
  };

  const LogoutDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-orange-600 mr-3" />
          <h3 className="text-lg font-semibold">Confirm Logout</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowLogoutDialog(false)}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowLogoutDialog(false);
              closeSidebar();
              handleLogout();
            }}
            className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center mb-4">
          <Trash2 size={24} className="text-red-600 mr-3" />
          <h3 className="text-lg font-semibold">Delete Account</h3>
        </div>
        <p className="text-gray-600 mb-6">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteDialog(false)}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowDeleteDialog(false);
              deleteRider();
              closeSidebar(); // Close sidebar before navigation
            }}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeSidebar} />
      )}

      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bike size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Hire4Drive</h2>
              <p className="text-blue-100 text-sm">Welcome back!</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="p-2 rounded-lg hover:bg-blue-500">
            <X size={20} className="text-white" />
          </button>
        </div>

        {isLoggedIn ? (
          <>
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{userProfile.initials}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{name}</h3>
                  <p className="text-sm text-gray-600">{mobile}</p>
                  <p className="text-xs text-blue-600 font-medium">Staff Member</p>
                </div>
              </div>
            </div>

            <div className="py-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full flex items-center space-x-4 px-6 py-4 text-left transition-colors ${
                      item.className || 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-4">
            <button
              onClick={loginButton.onClick}
              className={`w-full flex items-center space-x-4 px-6 py-4 text-left transition-colors ${loginButton.className}`}
            >
              <loginButton.icon size={20} />
              <span className="font-medium">{loginButton.label}</span>
            </button>
          </div>
        )}

        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-center text-xs text-gray-500">
            <p>© 2025 Hire4Drive</p>
          </div>
        </div>
      </div>

      {showLogoutDialog && <LogoutDialog />}
    </>
  );
};

export default Sidebar;