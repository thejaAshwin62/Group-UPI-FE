"use client";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import customFetch from "../utils/customFetch";

const ViewGroup = () => {
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showToast, setShowToast] = useState(false);
  const [showScanPayModal, setShowScanPayModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    shopUpiId: "",
    totalAmount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await customFetch.get(`/groups/${groupId}`);
        setGroupData(response.data.group);
      } catch (error) {
        console.error("Error fetching group details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "payments", label: "Payments", icon: "💳" },
  ];

  // Copy UPI link to clipboard
  const copyUpiLink = async () => {
    try {
      await navigator.clipboard.writeText(groupData.upiLink);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle pay now action
  const handlePayNow = (member) => {
    const upiUrl = `upi://pay?pa=${member.upiId}&pn=${member.name}&am=${member.share}&cu=INR`;
    window.open(upiUrl, "_blank");
  };

  // Send reminder (placeholder)
  const sendReminder = (member) => {
    console.log(`Sending reminder to ${member.name}`);
  };

  // Handle scan & pay submission
  const handleScanPaySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await customFetch.post("/payments/scan-pay", {
        groupId: groupData._id,
        shopUpiId: paymentDetails.shopUpiId,
        totalAmount: Number(paymentDetails.totalAmount),
      });
      if (response.data) {
        setShowScanPayModal(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center space-y-4 w-full max-w-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm sm:text-base text-center">
            Loading group details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile-Optimized Header Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="flex flex-col space-y-6 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 lg:gap-8">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {groupData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-2 break-words">
                      {groupData.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">
                          Created {formatDate(groupData.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">
                          Owner: {groupData.owner.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span>{groupData.memberCount} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center min-w-0 sm:min-w-[160px]">
                  <p className="text-xs sm:text-sm font-medium text-blue-600 mb-1">
                    Total Amount
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 break-words">
                    ₹{groupData.totalAmount}
                  </p>
                </div>
                <button
                  onClick={() => setShowScanPayModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  Scan & Pay
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile-Optimized Tab Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-1 sm:p-2">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm lg:text-base ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className="text-base sm:text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mobile-Optimized Content Area */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
        >
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Group Information Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-200/50">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-base">
                            ℹ️
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                          Group Details
                        </h3>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-blue-200/50 gap-1 sm:gap-0">
                          <span className="font-medium text-slate-600 text-sm sm:text-base">
                            Group Name
                          </span>
                          <span className="font-semibold text-slate-800 text-sm sm:text-base break-words">
                            {groupData.name}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-blue-200/50 gap-1 sm:gap-0">
                          <span className="font-medium text-slate-600 text-sm sm:text-base">
                            Total Amount
                          </span>
                          <span className="font-semibold text-slate-800 text-sm sm:text-base">
                            ₹{groupData.totalAmount}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-blue-200/50 gap-1 sm:gap-0">
                          <span className="font-medium text-slate-600 text-sm sm:text-base">
                            Created By
                          </span>
                          <span className="font-semibold text-slate-800 text-sm sm:text-base break-words">
                            {groupData.owner.name}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 gap-1 sm:gap-0">
                          <span className="font-medium text-slate-600 text-sm sm:text-base">
                            Owner Email
                          </span>
                          <span className="font-semibold text-slate-800 text-sm sm:text-base break-all">
                            {groupData.owner.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/50">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-base">
                            📈
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                          Quick Stats
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                          <p className="text-xl sm:text-2xl font-bold text-blue-600">
                            {groupData.memberCount}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-slate-600">
                            Total Members
                          </p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                          <p className="text-xl sm:text-2xl font-bold text-green-600">
                            ₹{groupData.totalAmount}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-slate-600">
                            Group Total
                          </p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                          <p className="text-xl sm:text-2xl font-bold text-purple-600">
                            ₹
                            {groupData.totalAmount > 0
                              ? (
                                  groupData.totalAmount / groupData.memberCount
                                ).toFixed(2)
                              : "0"}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-slate-600">
                            Per Member
                          </p>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm">
                          <p className="text-xl sm:text-2xl font-bold text-orange-600">
                            Active
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-slate-600">
                            Status
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "members" && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                      Group Members
                    </h3>
                    <div className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-2 rounded-full font-semibold text-sm sm:text-base w-fit">
                      {groupData.memberCount} Members
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {groupData.members.map((member, index) => (
                      <motion.div
                        key={member.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-base sm:text-lg truncate">
                              {member.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                            <span className="text-slate-600 font-medium text-sm sm:text-base">
                              Amount:
                            </span>
                            <span className="font-bold text-slate-800 text-base sm:text-lg">
                              ₹{member.amount || 0}
                            </span>
                          </div>
                          {member.upiLink && (
                            <div className="p-3 bg-blue-50 rounded-lg sm:rounded-xl">
                              <span className="text-blue-600 font-medium text-xs sm:text-sm">
                                UPI:
                              </span>
                              <p className="text-blue-800 font-mono text-xs sm:text-sm mt-1 break-all">
                                {member.upiLink}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-2 px-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-colors">
                              Pay Now
                            </button>
                            <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 sm:py-2 px-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-colors">
                              Remind
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "payments" && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8 sm:py-12 lg:py-16"
                >
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-3xl lg:text-4xl">
                        💳
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-800">
                      Payment Tracking
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8">
                      Advanced payment tracking and management features are
                      coming soon to help you monitor all group transactions.
                    </p>
                    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
                      <p className="text-blue-800 font-medium text-sm sm:text-base">
                        🚀 Feature in development
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Mobile-Optimized Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto bg-white shadow-2xl border border-green-200 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center space-x-3 z-50 max-w-sm sm:max-w-none mx-auto sm:mx-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm">✓</span>
            </div>
            <span className="font-medium text-slate-800 text-sm sm:text-base">
              UPI Link copied successfully!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-Optimized Scan & Pay Modal */}
      <AnimatePresence>
        {showScanPayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                      Scan & Pay
                    </h3>
                    <p className="text-slate-600 mt-1 text-sm sm:text-base">
                      Enter payment details
                    </p>
                  </div>
                  <button
                    onClick={() => setShowScanPayModal(false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <span className="text-slate-600 text-sm sm:text-base">
                      ✕
                    </span>
                  </button>
                </div>
                <form
                  onSubmit={handleScanPaySubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Shop UPI ID
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.shopUpiId}
                      onChange={(e) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          shopUpiId: e.target.value,
                        }))
                      }
                      required
                      placeholder="Enter shop UPI ID"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Total Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentDetails.totalAmount}
                      onChange={(e) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          totalAmount: e.target.value,
                        }))
                      }
                      required
                      min="1"
                      placeholder="Enter amount"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-white transition-all duration-200 text-sm sm:text-base ${
                      isSubmitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Proceed to Pay"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewGroup;
