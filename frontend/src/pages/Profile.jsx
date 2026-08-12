import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.profile?.full_name || "",
    bio:       user?.profile?.bio       || "",
    phone:     user?.profile?.phone     || "",
    country:   user?.profile?.country   || "",
  });
  const [saving,        setSaving]        = useState(false);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar_url || null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        await api.post("/users/me/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await api.put("/users/me/profile", form);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1 className="profile-card__title">Edit Profile</h1>

        {/* Avatar */}
        <div className="profile-avatar-row">
          <div className="profile-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="profile-avatar__img" />
            ) : (
              <div className="profile-avatar__placeholder">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="profile-avatar__edit-btn"
              aria-label="Upload avatar"
            >
              ✎
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-user-info">
            <p className="profile-user-info__name">{user?.username}</p>
            <p className="profile-user-info__email">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form className="profile-form" onSubmit={handleSave}>
          {[
            { label: "Full Name", field: "full_name", type: "text" },
            { label: "Phone",     field: "phone",     type: "tel"  },
            { label: "Country",   field: "country",   type: "text" },
          ].map(({ label, field, type }) => (
            <div key={field} className="profile-form__group">
              <label className="profile-form__label">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={update(field)}
                className="profile-form__input"
                aria-label={label}
              />
            </div>
          ))}

          <div className="profile-form__group">
            <label className="profile-form__label">Bio</label>
            <textarea
              value={form.bio}
              onChange={update("bio")}
              rows={3}
              className="profile-form__textarea"
              aria-label="Bio"
            />
          </div>

          <button
            type="submit"
            className="profile-form__submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
