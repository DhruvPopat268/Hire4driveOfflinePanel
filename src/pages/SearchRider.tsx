import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Search, User, Plus } from 'lucide-react';
import apiClient from '@/lib/axiosInterceptor';

export default function SearchRider() {
  const [loading, setLoading] = useState(false);
  const [rider, setRider] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const searchForm = useForm({
    defaultValues: { mobile: "" }
  });

  const createForm = useForm({
    defaultValues: {
      mobile: "",
      name: "",
      gender: "",
      email: "",
      referralCodeUsed: ""
    }
  });

  const navigate = useNavigate();

  const handleSearch = async (data) => {
    setLoading(true);
    setRider(null);
    setShowCreateForm(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    
    try {
      const res = await apiClient.get(`${import.meta.env.VITE_API_URL}/api/offline-staff/search-riders?mobile=${data.mobile}`);
      
      if (res.data.success === true && res.data.data && res.data.data._id) {
        setRider(res.data.data);
        setShowCreateForm(false);
        setOtpSent(false);
        setOtpVerified(false);
        setOtp("");
        setLoading(false);
        return;
      }
      
      setRider(null);
      setShowCreateForm(true);
      createForm.setValue("mobile", data.mobile);
    } catch (err) {
      console.error("Error searching rider:", err);
      alert("Server error while searching rider");
      setRider(null);
      setShowCreateForm(true);
      createForm.setValue("mobile", data.mobile);
    }
    setLoading(false);
  };

  const handleCreateRider = async (data) => {
    setLoading(true);
    try {
      const res = await apiClient.post(`${import.meta.env.VITE_API_URL}/api/offline-staff/save-rider-profile`, data);

      if (res.data.success) {
        setRider(res.data.rider);
        setShowCreateForm(false);
      } else {
        alert(res.data.message || "Failed to create rider");
      }
    } catch (err) {
      console.error("Error creating rider:", err);
      alert("Server error while creating rider");
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await apiClient.post(`${import.meta.env.VITE_API_URL}/api/offline-staff/send-otp`, {
        mobile: rider.mobile
      });
      if (res.data.success) {
        setOtpSent(true);
        if (res.data.otp) {
          setOtp(res.data.otp);
        }
      } else {
        alert(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Error sending OTP");
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await apiClient.post(`${import.meta.env.VITE_API_URL}/api/rider-auth/verify-otp`, {
        mobile: rider.mobile,
        otp: otp
      });
      if (res.data.success) {
        setOtpVerified(true);
      } else {
        alert(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("Error verifying OTP");
    }
    setOtpLoading(false);
  };

  const handleBookForRider = () => {
    if (rider) {
      navigate("/categories", { state: { riderId: rider._id, riderName: rider.name } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Search Section */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Search size={24} />
              Search Rider
            </CardTitle>
            <p className="text-gray-600">Enter mobile number to find existing rider</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchForm.handleSubmit(handleSearch)} className="flex gap-3">
              <Input
                type="tel"
                placeholder="Enter mobile number"
                className="flex-1"
                {...searchForm.register("mobile", {
                  required: "Mobile number is required",
                  minLength: { value: 10, message: "Mobile number must be at least 10 digits" }
                })}
              />
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
            {searchForm.formState.errors.mobile && (
              <p className="text-red-500 text-sm mt-2">{searchForm.formState.errors.mobile.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Rider Found */}
        {rider && (
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                <User size={20} />
                Rider Found
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{rider?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mobile:</span>
                  <span>{rider?.mobile || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Gender:</span>
                  <span className="capitalize">{rider?.gender || 'N/A'}</span>
                </div>
                {rider?.email && (
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{rider.email}</span>
                  </div>
                )}
              </div>
              
              {!otpSent ? (
                <Button 
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              ) : !otpVerified ? (
                <div className="mt-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || !otp}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {otpLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleBookForRider}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                >
                  Book Ride for {rider.name}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create New Rider */}
        {showCreateForm && (
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                <Plus size={20} />
                Create New Rider
              </CardTitle>
              <p className="text-orange-600">Rider not found. Create a new profile.</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={createForm.handleSubmit(handleCreateRider)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                  <Input
                    type="tel"
                    {...createForm.register("mobile", { required: "Mobile number is required" })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    {...createForm.register("name", { required: "Name is required" })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...createForm.register("gender", { required: "Gender is required" })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...createForm.register("email")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Enter referral code"
                    {...createForm.register("referralCodeUsed")}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? "Creating..." : "Create Rider"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}