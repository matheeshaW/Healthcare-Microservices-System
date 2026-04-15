/**
 * DoctorSearch Component
 */

import { useState, useCallback } from "react";
import { useDoctors } from "../../hooks/useDoctors";

export const DoctorSearch = ({
  onResultsChange,
  showVerifiedFilter = true,
  className = "",
  ...props
}) => {
  const {
    searchDoctorsBySpecialization,
    getSpecializations,
    searchLoading,
    searchError,
  } = useDoctors();

  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!selectedSpecialization) {
      alert("Please select a specialization");
      return;
    }

    try {
      setSearchPerformed(true);
      const response = await searchDoctorsBySpecialization(
        selectedSpecialization,
        verifiedFilter,
      );

      if (onResultsChange) {
        onResultsChange(response.data || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  }, [
    selectedSpecialization,
    verifiedFilter,
    searchDoctorsBySpecialization,
    onResultsChange,
  ]);

  const handleReset = useCallback(() => {
    setSelectedSpecialization("");
    setVerifiedFilter(true);
    setSearchPerformed(false);
    if (onResultsChange) {
      onResultsChange([]);
    }
  }, [onResultsChange]);

  const specializations = getSpecializations();

  return (
    <div
      className={`
        bg-white rounded-lg p-6 shadow-md
        border border-slate-200
        ${className}
      `}
      {...props}
    >
      <h3 className="text-xl font-bold text-slate-900 mb-6">Find a Doctor</h3>

      {/* Search Form */}
      <div className="space-y-4">
        {/* Specialization Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Medical Specialization
          </label>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="
              w-full px-4 py-2.5 rounded-lg
              border border-slate-300 bg-white
              text-slate-900 font-medium
              focus:outline-none focus:ring-2 focus:ring-cyan-500
              transition
            "
            disabled={searchLoading}
          >
            <option value="">-- Select Specialization --</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Filter */}
        {showVerifiedFilter && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Verification Status
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setVerifiedFilter(true)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-semibold transition
                  ${
                    verifiedFilter
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                `}
                disabled={searchLoading}
              >
                Verified Only
              </button>
              <button
                onClick={() => setVerifiedFilter("all")}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-semibold transition
                  ${
                    verifiedFilter === "all"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                `}
                disabled={searchLoading}
              >
                All Doctors
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {searchError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {searchError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSearch}
            disabled={searchLoading || !selectedSpecialization}
            className="
              flex-1 px-4 py-2.5 rounded-lg
              bg-cyan-600 hover:bg-cyan-700
              text-white font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={handleReset}
            disabled={searchLoading}
            className="
              flex-1 px-4 py-2.5 rounded-lg
              bg-slate-200 hover:bg-slate-300
              text-slate-900 font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
              transition
            "
          >
            Reset
          </button>
        </div>

        {/* Search Status */}
        {searchPerformed && !searchLoading && (
          <p className="text-sm text-slate-600 text-center pt-2">
            Search complete. Scroll down to view results.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;
