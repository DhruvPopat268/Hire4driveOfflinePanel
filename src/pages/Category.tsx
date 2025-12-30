import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axiosInterceptor';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { User, Car, Package, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Sidebar';
import { useDispatch } from 'react-redux';
import { setRiderInfo } from '../store/slices/bookingSlice';

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riderInfo, setRiderInfoState] = useState(null);

  // Icon mappings
  const categoryIconMap = {
    Driver: User,
    Cab: Car,
    Parcel: Package,
  };

  // Fetch categories on component mount
  useEffect(() => {
    // Handle rider info from navigation state
    if (location.state?.riderId && location.state?.riderName) {
      const { riderId, riderName } = location.state;
      setRiderInfoState({ riderId, riderName });
      dispatch(setRiderInfo({ riderId, riderName }));
    }

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/categories`);
        if (res.status === 200) {
          setCategories(res.data || []);
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Something went wrong while loading categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category selection
  const handleCategorySelect = async (categoryId) => {
    try {
      const res = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/subcategories`);
      const subcategories = res.data || [];
      const filteredSubcategories = subcategories.filter(sub => sub.categoryId === categoryId);
      
      if (filteredSubcategories.length > 0) {
        navigate(`/subcategories/${categoryId}`);
      } else {
        navigate(`/booking/${categoryId}`);
      }
    } catch (error) {
      console.error('Error checking subcategories:', error);
      navigate(`/booking/${categoryId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar title="Select Category" />
        <div className="flex justify-center items-center min-h-[200px] px-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar title="Select Category" />
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar title="Select Category" />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {riderInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium">
                Booking for: <span className="font-bold">{riderInfo.riderName}</span>
              </p>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Book Your Service
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Choose your service category to get started
          </p>
        </div>

        {/* Categories Grid - Desktop & Tablet */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = categoryIconMap[category.name] || Car;
            
            return (
              <Card
                key={category._id}
                className="bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-0 hover:border-black"
                onClick={() => handleCategorySelect(category._id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                      )}
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    
                    <div className="bg-black text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center">
                      Select {category.name}
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories List - Mobile */}
        <div className="sm:hidden space-y-3 mb-12">
          {categories.map((category) => {
            const IconComponent = categoryIconMap[category.name] || Car;
            
            return (
              <Card
                key={category._id}
                className="bg-white shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] border-0"
                onClick={() => handleCategorySelect(category._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IconComponent className="w-6 h-6 text-black" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {category.description}
                      </p>
                    </div>

                    <div className="flex items-center flex-shrink-0">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Category;
