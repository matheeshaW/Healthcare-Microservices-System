import { useEffect, useMemo, useState } from "react";
import {
  changeMyPassword,
  deleteMyAccount,
  getMyAccount,
  updateMyAccount,
} from "../../api/user.api";
import { Button, Card, Modal } from "../ui";

function AccountSettingsModal({ isOpen, onClose, onAccountUpdated, onAccountDeleted }) {
  const [account, setAccount] = useState({ name: "", email: "", phone: "" });
  const [confirmAccountUpdate, setConfirmAccountUpdate] = useState(false);
  const [accountErrors, setAccountErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    confirmChange: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [deleteForm, setDeleteForm] = useState({
    currentPassword: "",
    confirmText: "",
    confirmDelete: false,
  });
  const [deleteErrors, setDeleteErrors] = useState({});

  const [banner, setBanner] = useState({ type: "", message: "" });
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";
  const inputErrorClass = "border-red-400 focus:border-red-500 focus:ring-red-200";

  const hasAnyValidationErrors = useMemo(() => {
    return (
      Object.values(accountErrors).some(Boolean) ||
      Object.values(passwordErrors).some(Boolean) ||
      Object.values(deleteErrors).some(Boolean)
    );
  }, [accountErrors, passwordErrors, deleteErrors]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const load = async () => {
      try {
        setLoadingAccount(true);
        setBanner({ type: "", message: "" });
        setAccountErrors({});
        setPasswordErrors({});
        setDeleteErrors({});

        const res = await getMyAccount();
        const data = res?.data?.data || {};
        setAccount({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setConfirmAccountUpdate(false);
      } catch (err) {
        setBanner({
          type: "error",
          message:
            err?.response?.data?.message ||
            "Failed to load account settings.",
        });
      } finally {
        setLoadingAccount(false);
      }
    };

    load();
  }, [isOpen]);

  const validateAccount = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?\d{7,15}$/;

    if (!account.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!account.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(account.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (account.phone && !phoneRegex.test(account.phone.trim())) {
      nextErrors.phone = "Phone must be 7-15 digits and may start with +.";
    }

    if (!confirmAccountUpdate) {
      nextErrors.confirmUpdate = "Please confirm account detail update.";
    }

    return nextErrors;
  };

  const validatePassword = () => {
    const nextErrors = {};

    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!passwordForm.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (passwordForm.newPassword.length < 8) {
      nextErrors.newPassword = "New password must be at least 8 characters.";
    }

    if (!passwordForm.confirmNewPassword) {
      nextErrors.confirmNewPassword = "Please confirm your new password.";
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      nextErrors.confirmNewPassword = "Passwords do not match.";
    }

    if (!passwordForm.confirmChange) {
      nextErrors.confirmChange = "Please confirm password change.";
    }

    return nextErrors;
  };

  const validateDelete = () => {
    const nextErrors = {};

    if (!deleteForm.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (deleteForm.confirmText !== "DELETE") {
      nextErrors.confirmText = "Type DELETE exactly to continue.";
    }

    if (!deleteForm.confirmDelete) {
      nextErrors.confirmDelete = "Please confirm account deletion.";
    }

    return nextErrors;
  };

  const handleSaveAccount = async () => {
    const nextErrors = validateAccount();
    setAccountErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setBanner({ type: "error", message: "Please fix account form errors." });
      return;
    }

    try {
      setSavingAccount(true);
      const res = await updateMyAccount({
        name: account.name.trim(),
        email: account.email.trim(),
        phone: account.phone.trim(),
      });

      const updatedUser = res?.data?.data;
      onAccountUpdated?.(updatedUser);
      setConfirmAccountUpdate(false);
      setAccountErrors({});
      setBanner({ type: "success", message: "Account details updated." });
    } catch (err) {
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to update account.",
      });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    const nextErrors = validatePassword();
    setPasswordErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setBanner({ type: "error", message: "Please fix password form errors." });
      return;
    }

    try {
      setChangingPassword(true);
      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        confirmChange: false,
      });
      setPasswordErrors({});
      setBanner({ type: "success", message: "Password changed successfully." });
    } catch (err) {
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const nextErrors = validateDelete();
    setDeleteErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setBanner({ type: "error", message: "Please complete deletion confirmation." });
      return;
    }

    try {
      setDeletingAccount(true);
      await deleteMyAccount({
        currentPassword: deleteForm.currentPassword,
        confirmText: deleteForm.confirmText,
      });

      setBanner({ type: "success", message: "Account deleted." });
      onAccountDeleted?.();
    } catch (err) {
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to delete account.",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Settings"
      size="xl"
      className="max-w-4xl"
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loadingAccount ? (
        <p className="text-sm text-slate-600">Loading account settings...</p>
      ) : (
        <div className="space-y-4">
          {hasAnyValidationErrors && (
            <Card border shadow="sm" className="border-amber-200 bg-amber-50">
              <p className="text-sm font-semibold text-amber-900">
                Please fix the highlighted fields before continuing.
              </p>
            </Card>
          )}

          {banner.message && (
            <Card
              border
              shadow="sm"
              className={
                banner.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-emerald-200 bg-emerald-50"
              }
            >
              <p
                className={
                  banner.type === "error"
                    ? "text-sm text-red-700"
                    : "text-sm text-emerald-700"
                }
              >
                {banner.message}
              </p>
            </Card>
          )}

          <Card border shadow="sm" className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Profile Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  className={`${inputClass} ${accountErrors.name ? inputErrorClass : ""}`}
                  value={account.name}
                  onChange={(e) => {
                    setAccount((prev) => ({ ...prev, name: e.target.value }));
                    setAccountErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {accountErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{accountErrors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  className={`${inputClass} ${accountErrors.email ? inputErrorClass : ""}`}
                  value={account.email}
                  onChange={(e) => {
                    setAccount((prev) => ({ ...prev, email: e.target.value }));
                    setAccountErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
                {accountErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{accountErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Phone (optional)
              </label>
              <input
                className={`${inputClass} ${accountErrors.phone ? inputErrorClass : ""}`}
                value={account.phone}
                onChange={(e) => {
                  setAccount((prev) => ({ ...prev, phone: e.target.value }));
                  setAccountErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />
              {accountErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{accountErrors.phone}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={confirmAccountUpdate}
                onChange={(e) => {
                  setConfirmAccountUpdate(e.target.checked);
                  setAccountErrors((prev) => ({ ...prev, confirmUpdate: undefined }));
                }}
              />
              I confirm I want to update my account details.
            </label>
            {accountErrors.confirmUpdate && (
              <p className="text-xs text-red-600">{accountErrors.confirmUpdate}</p>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSaveAccount} loading={savingAccount}>
                Save Details
              </Button>
            </div>
          </Card>

          <Card border shadow="sm" className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  className={`${inputClass} ${passwordErrors.currentPassword ? inputErrorClass : ""}`}
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                    setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  className={`${inputClass} ${passwordErrors.newPassword ? inputErrorClass : ""}`}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                    setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={`${inputClass} ${passwordErrors.confirmNewPassword ? inputErrorClass : ""}`}
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }));
                    setPasswordErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
                  }}
                />
                {passwordErrors.confirmNewPassword && (
                  <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmNewPassword}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={passwordForm.confirmChange}
                onChange={(e) => {
                  setPasswordForm((prev) => ({ ...prev, confirmChange: e.target.checked }));
                  setPasswordErrors((prev) => ({ ...prev, confirmChange: undefined }));
                }}
              />
              I confirm I want to change my password.
            </label>
            {passwordErrors.confirmChange && (
              <p className="text-xs text-red-600">{passwordErrors.confirmChange}</p>
            )}

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={handleChangePassword}
                loading={changingPassword}
              >
                Update Password
              </Button>
            </div>
          </Card>

          <Card border shadow="sm" className="space-y-4 border-red-200 bg-red-50">
            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-700">
              Deleting your account is permanent. This action cannot be undone.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  className={`${inputClass} ${deleteErrors.currentPassword ? inputErrorClass : ""}`}
                  value={deleteForm.currentPassword}
                  onChange={(e) => {
                    setDeleteForm((prev) => ({ ...prev, currentPassword: e.target.value }));
                    setDeleteErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }}
                />
                {deleteErrors.currentPassword && (
                  <p className="mt-1 text-xs text-red-600">{deleteErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Type DELETE to confirm
                </label>
                <input
                  className={`${inputClass} ${deleteErrors.confirmText ? inputErrorClass : ""}`}
                  value={deleteForm.confirmText}
                  onChange={(e) => {
                    setDeleteForm((prev) => ({ ...prev, confirmText: e.target.value }));
                    setDeleteErrors((prev) => ({ ...prev, confirmText: undefined }));
                  }}
                />
                {deleteErrors.confirmText && (
                  <p className="mt-1 text-xs text-red-600">{deleteErrors.confirmText}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-red-800">
              <input
                type="checkbox"
                checked={deleteForm.confirmDelete}
                onChange={(e) => {
                  setDeleteForm((prev) => ({ ...prev, confirmDelete: e.target.checked }));
                  setDeleteErrors((prev) => ({ ...prev, confirmDelete: undefined }));
                }}
              />
              I understand this action is permanent.
            </label>
            {deleteErrors.confirmDelete && (
              <p className="text-xs text-red-600">{deleteErrors.confirmDelete}</p>
            )}

            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={deletingAccount}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
}

export default AccountSettingsModal;
