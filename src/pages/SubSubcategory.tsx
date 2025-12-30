import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axiosInterceptor';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, RotateCcw, ChevronRight } from 'lucide-react';

const SubSubcategory = () => {
  const navigate = useNavigate();
  const { categoryId, subcategoryId } = useParams();

  const [subSubcategories, setSubSubcategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId || !subcategoryId) {
        setError('Category or Subcategory ID not found');
        setLoading(false);
        return;
      }

      try {
        const subSubcategoriesRes = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/subsubcategories`);
        const allSubSubcategories = subSubcategoriesRes.data || [];
        const filteredSubSubcategories = allSubSubcategories.filter(sub => sub.categoryId === categoryId);

        setSubSubcategories(filteredSubSubcategories);
        
        if (filteredSubSubcategories.length > 0) {
          setCategoryName(filteredSubSubcategories[0].categoryName);
          setSubcategoryName(filteredSubSubcategories[0].subCategoryName);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Something went wrong while loading sub-subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, subcategoryId]);

  const handleSubSubcategorySelect = (subSubcategoryId) => {
    navigate(`/booking/${categoryId}/${subcategoryId}/${subSubcategoryId}`);
  };

  const handleBack = () => {
    navigate(`/subcategories/${categoryId}`);
  };

  const getIconForSubSubcategory = (name) => {
    const normalizedName = name.toLowerCase().trim();
    if (normalizedName.includes('oneway') || normalizedName.includes('one-way')) return MapPin;
    if (normalizedName.includes('roundtrip') || normalizedName.includes('round')) return RotateCcw;
    return MapPin;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-6">
          <div className="flex items-center justify-center relative mb-6 sm:mb-8">
            <button onClick={handleBack} className="absolute left-0 flex items-center text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {subcategoryName} Options
            </h1>
          </div>
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-6">
          <div className="flex items-center justify-center relative mb-6 sm:mb-8">
            <button onClick={handleBack} className="absolute left-0 flex items-center text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Error</h1>
          </div>
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
        <div className="flex items-center justify-center relative mb-6 sm:mb-8">
          <button onClick={handleBack} className="absolute left-0 flex items-center text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {subcategoryName} Options
          </h1>
        </div>

        <p className="text-sm sm:text-base text-gray-600 text-center px-4 mb-6">
          Choose your {subcategoryName.toLowerCase()} service type
        </p>

        <div className="space-y-4">
          {subSubcategories.map((subSubcategory) => {
            const IconComponent = getIconForSubSubcategory(subSubcategory.name);

            return (
              <Card
                key={subSubcategory.id}
                className="bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border rounded-lg"
                onClick={() => handleSubSubcategorySelect(subSubcategory.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {subSubcategory.image ? (
                          <img
                            src={subSubcategory.image}
                            alt={subSubcategory.name}
                            className="w-10 h-10 object-cover rounded-md"
                          />
                        ) : (
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{subSubcategory.name}</h3>
                        <p className="text-sm text-gray-500">{subSubcategory.description}</p>
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

export default SubSubcategory;