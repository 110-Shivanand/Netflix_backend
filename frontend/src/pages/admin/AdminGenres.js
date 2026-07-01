import React, { useEffect, useState } from "react";
import { genresAPI } from "../../api/genres";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import "./Admin.css";

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await genresAPI.getAll();
      setGenres(res.data);
    } catch {}
    setLoading(false);
  };

  const autoSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await genresAPI.create(form);
      toast.success("Genre created");
      setForm({ name: "", slug: "", description: "" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete genre "${name}"?`)) return;
    try {
      await genresAPI.delete(id);
      toast.success("Genre deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 pb-16 px-6 md:px-12">
      <h1 className="text-white text-3xl font-bold mb-8">Manage Genres</h1>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="bg-gray-900 rounded-lg p-6 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-gray-400 text-xs block mb-1">Name *</label>
          <input
            required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
            aria-label="Genre name"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-gray-400 text-xs block mb-1">Slug *</label>
          <input
            required value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
            aria-label="Slug"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-gray-400 text-xs block mb-1">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
            aria-label="Description"
          />
        </div>
        <button
          type="submit" disabled={saving}
          className="bg-netflix-red text-white px-6 py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Genre"}
        </button>
      </form>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div key={genre.id} className="bg-gray-900 rounded-lg px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{genre.name}</p>
                <p className="text-gray-500 text-xs">{genre.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(genre.id, genre.name)}
                className="text-red-500 hover:text-red-400 ml-3"
                aria-label={`Delete genre ${genre.name}`}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
