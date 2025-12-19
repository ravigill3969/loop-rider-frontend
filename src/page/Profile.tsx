import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "" as string | undefined,
    email: "" as string | undefined,
    phone_number: "" as string | undefined,
    birth_month: "1" as string | undefined,
    birth_year: 2000 as number | undefined,
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const init = () => {
      setFormData({
        birth_month: user.birth_month,
        birth_year: user.birth_year,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
      });
    };

    init();
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setFormData({
      full_name: "test",
      email: "test@test.com",
      phone_number: "+1234567890",
      birth_month: "January",
      birth_year: 1990,
    });
    setIsEditing(false);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-8 sm:px-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {formData.full_name}
                </h2>
                <p className="text-blue-100 text-sm mt-1">{formData.email}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Edit Button */}
          {!isEditing && (
            <div className="sm:hidden px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}

          {/* Form Content */}
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 text-base px-4 py-2.5 bg-gray-50 rounded-lg">
                    {formData.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 text-base px-4 py-2.5 bg-gray-50 rounded-lg">
                    {formData.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                  />
                ) : (
                  <p className="text-gray-900 text-base px-4 py-2.5 bg-gray-50 rounded-lg">
                    {formData.phone_number}
                  </p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date of Birth</span>
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={formData.birth_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birth_month: e.target.value,
                        })
                      }
                      className="px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                    >
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.birth_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birth_year: parseInt(e.target.value),
                        })
                      }
                      className="px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-gray-900 text-base px-4 py-2.5 bg-gray-50 rounded-lg">
                    {formData.birth_month} {formData.birth_year}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Account Info Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
              <p>
                Account ID:{" "}
                <span className="font-mono text-xs">
                  70769b25-4b5b-48f6-85a2-f712524b8906
                </span>
              </p>
              <p>
                Member since: <span className="font-medium">Dec 2024</span>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          {/* Security Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Security
            </h3>
            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Change Password
            </button>
            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2">
              Two-Factor Authentication
            </button>
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preferences
            </h3>
            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Notification Settings
            </button>
            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2">
              Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
