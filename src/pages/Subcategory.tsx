import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axiosInterceptor';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Clock, MapPin, Calendar, RotateCcw, Repeat, Car, ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/Sidebar';

const Subcategory = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [subcategories, setSubcategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) {
        setError('Category ID not found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const subcategoriesRes = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/subcategories`);
        const allSubcategories = subcategoriesRes.data || [];
        const filteredSubcategories = allSubcategories.filter(sub => sub.categoryId === categoryId);

        const categoriesRes = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/categories`);
        const categories = categoriesRes.data || [];
        const category = categories.find(cat => cat._id === categoryId);

        setSubcategories(filteredSubcategories);
        setCategoryName(category?.name || 'Category');

        if (filteredSubcategories.length === 0) {
          navigate(`/booking/${categoryId}`);
          return;
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Something went wrong while loading subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, navigate]);

  const handleSubcategorySelect = async (subcategory) => {
    // Check if it's outstation subcategory
    if (subcategory.name.toLowerCase().includes('outstation')) {
      try {
        // Check if sub-subcategories exist for this subcategory
        const res = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/subsubcategories`);
        const subSubcategories = res.data || [];
        const filteredSubSubcategories = subSubcategories.filter(sub => sub.categoryId === categoryId);
        
        if (filteredSubSubcategories.length > 0) {
          // Navigate to sub-subcategories page if they exist
          navigate(`/subsubcategories/${categoryId}/${subcategory.id}`);
        } else {
          // Navigate directly to booking if no sub-subcategories
          navigate(`/booking/${categoryId}/${subcategory.id}`);
        }
      } catch (error) {
        console.error('Error checking sub-subcategories:', error);
        // Fallback to direct booking navigation
        navigate(`/booking/${categoryId}/${subcategory.id}`);
      }
    } else {
      // For non-outstation subcategories, go directly to booking
      navigate(`/booking/${categoryId}/${subcategory.id}`);
    }
  };

  // 🔹 Back to Home ("/")
  const handleBack = () => {
    navigate('/');
  };

  const getIconForSubcategory = (name) => {
    const normalizedName = name.toLowerCase().trim();

    if (normalizedName.includes('one-way') || normalizedName.includes('oneway')) return MapPin;
    if (normalizedName.includes('hourly') || normalizedName.includes('hour')) return Clock;
    if (normalizedName.includes('outstation') || normalizedName.includes('intercity')) return RotateCcw;
    if (normalizedName.includes('monthly') || normalizedName.includes('month')) return Calendar;
    if (normalizedName.includes('weekly') || normalizedName.includes('week')) return Repeat;
    if (normalizedName.includes('round') || normalizedName.includes('return')) return RotateCcw;
    if (normalizedName.includes('daily') || normalizedName.includes('day')) return Calendar;
    if (normalizedName.includes('airport')) return MapPin;
    if (normalizedName.includes('local')) return Car;

    return Car;
  };

  const getSubtitleForSubcategory = (name) => {
    const normalizedName = name.toLowerCase().trim();

    if (normalizedName.includes('one-way') || normalizedName.includes('oneway')) return 'Point to Point';
    if (normalizedName.includes('hourly') || normalizedName.includes('hour')) return 'Book by Hours';
    if (normalizedName.includes('outstation') || normalizedName.includes('intercity')) return 'City to City';
    if (normalizedName.includes('monthly') || normalizedName.includes('month')) return 'Long Term';
    if (normalizedName.includes('weekly') || normalizedName.includes('week')) return 'Weekly Plans';
    if (normalizedName.includes('round') || normalizedName.includes('return')) return 'Round Trip';
    if (normalizedName.includes('daily') || normalizedName.includes('day')) return 'Daily Service';
    if (normalizedName.includes('airport')) return 'Airport Transfer';
    if (normalizedName.includes('local')) return 'Local Service';

    return 'Service Booking';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 🔹 Show Back Arrow */}
        <Navbar title={`${categoryName} Services`} showBack onBack={handleBack} />
        <div className="flex justify-center items-center min-h-[200px] px-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar title={`${categoryName} Services`} showBack onBack={handleBack} />
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">


<div className="max-w-xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-6">
  {/* 🔹 Header with Back Arrow + Title */}
  <div className="flex items-center justify-center relative mb-6 sm:mb-8">
    <button
      onClick={handleBack}
      className="absolute left-0 flex items-center text-gray-700 hover:text-gray-900"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
      {categoryName} Services
    </h1>
  </div>

  <p className="text-sm sm:text-base text-gray-600 text-center px-4 mb-6">
    Choose your {categoryName.toLowerCase()} service type
  </p>

  {/* Vertical List Layout */}
  <div className="space-y-4">
    {subcategories.map((subcategory) => {
      const IconComponent = getIconForSubcategory(subcategory.name);
      const subtitle = getSubtitleForSubcategory(subcategory.name);

      return (
        <Card
          key={subcategory.id}
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border rounded-lg"
          onClick={() => handleSubcategorySelect(subcategory)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {subcategory.image ? (
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  ) : (
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{subcategory.name}</h3>
                  <p className="text-sm text-gray-500">{subcategory.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
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

export default Subcategory;
