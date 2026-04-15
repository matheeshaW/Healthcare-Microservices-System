/**
 * DoctorCard Component
 */

import { Card, Badge, StatusChip } from "../ui";

export const DoctorCard = ({
  doctor,
  onViewDetails,
  onBookAppointment,
  onVerify,
  isAdmin = false,
  className = "",
  ...props
}) => {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < Math.round(rating) ? "text-amber-400" : "text-slate-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <Card
      padding="md"
      shadow="md"
      hoverEffect={true}
      className={`flex flex-col gap-4 ${className}`}
      {...props}
    >
      {/* Header: Name and Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
          <p className="text-sm text-slate-600">{doctor.specialization}</p>
        </div>
        <StatusChip
          status={doctor.verified ? "verified" : "unverified"}
          size="sm"
        />
      </div>

      {/* Experience and Hospital */}
      <div className="space-y-1">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Experience:</span> {doctor.experience}{" "}
          years
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Hospital:</span> {doctor.hospital}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Contact:</span> {doctor.phoneNumber}
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div>{renderStars(doctor.rating)}</div>
        <span className="text-sm text-slate-600">
          {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
        </span>
      </div>

      {/* License Badge */}
      <div>
        <Badge variant="specialization" size="sm">
          License: {doctor.licenseNumber.substring(0, 8)}...
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 rounded-lg bg-cyan-100 text-cyan-700 font-semibold hover:bg-cyan-200 transition text-sm"
        >
          View Details
        </button>

        {!isAdmin && onBookAppointment && (
          <button
            onClick={onBookAppointment}
            className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm"
          >
            Book Appointment
          </button>
        )}

        {isAdmin && onVerify && (
          <button
            onClick={onVerify}
            className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm"
          >
            Verify Doctor
          </button>
        )}
      </div>
    </Card>
  );
};

export default DoctorCard;
