import React, { useEffect, useState } from "react";
import { moviesAPI } from "../../api/movies";
import { genresAPI } from "../../api/genres";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import "./Admin.css";
import { FaTrash, FaUpload, FaEdit } from "react-icons/fa";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", description: "", language: "", country: "",
    maturity_rating: "PG-13", imdb_rating: "", is_featured: false,
    is_trending: false, is_new_release: false, genre_ids: [],
  });
  const [uploadState, setUploadState] = useState({});

  useEffect(() => {
    loadMovies();
    genresAPI.getAll().then((r) => setGenres(r.data)).catch(() => {});
  }, [page]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const res = await moviesAPI.getAll({ page, page_size: 15 });
      setMovies(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        imdb_rating: form.imdb_rating ? parseFloat(form.imdb_rating) : null,
      };
      await moviesAPI.create(payload);
      toast.success("Movie created");
      setShowForm(false);
      setForm({ title: "", slug: "", description: "", language: "", country: "",
        maturity_rating: "PG-13", imdb_rating: "", is_featured: false,
        is_trending: false, is_new_release: false, genre_ids: [] });
      loadMovies();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create movie");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await moviesAPI.delete(id);
      toast.success("Deleted");
      loadMovies();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleFileUpload = async (movieId, file, type) => {
    setUploadState((s) => ({ ...s, [movieId + type]: true }));
    try {
      if (type === "thumbnail") await moviesAPI.uploadThumbnail(movieId, file);
      else if (type === "banner") await moviesAPI.uploadBanner(movieId, file);
      else if (type === "video") {
        const fd = new FormData();
        fd.append("file", file);
        await api.post(`/stream/movie/${movieId}/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success(`${type} uploaded`);
      loadMovies();
    } catch (e) {
      toast.error(e.response?.data?.detail || `Failed to upload ${type}`);
    }
    setUploadState((s) => ({ ...s, [movieId + type]: false }));
  };

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 pb-16 px-6 md:px-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-bold">Manage Movies</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-netflix-red text-white px-5 py-2 rounded font-medium hover:bg-red-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Movie"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-gray-900 rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-gray-400 text-xs block mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="Movie title"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Slug *</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="Slug"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red resize-none"
              aria-label="Description"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Language</label>
            <input
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="Language"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Maturity Rating</label>
            <select
              value={form.maturity_rating}
              onChange={(e) => setForm({ ...form, maturity_rating: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="Maturity rating"
            >
              {["G", "PG", "PG-13", "R", "NC-17"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">IMDb Rating</label>
            <input
              type="number" step="0.1" min="0" max="10"
              value={form.imdb_rating}
              onChange={(e) => setForm({ ...form, imdb_rating: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="IMDb rating"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <label key={g.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.genre_ids.includes(g.id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setForm({ ...form, genre_ids: [...form.genre_ids, g.id] });
                      else
                        setForm({ ...form, genre_ids: form.genre_ids.filter((id) => id !== g.id) });
                    }}
                    className="accent-netflix-red"
                  />
                  <span className="text-gray-300 text-xs">{g.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-6 items-center">
            {["is_featured", "is_trending", "is_new_release"].map((key) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="accent-netflix-red"
                />
                <span className="text-gray-300 text-xs capitalize">{key.replace("is_", "")}</span>
              </label>
            ))}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-netflix-red text-white px-6 py-2.5 rounded font-medium hover:bg-red-700 transition-colors"
            >
              Create Movie
            </button>
          </div>
        </form>
      )}

      {/* Movies Table */}
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Genres</th>
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Video</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id} className="border-t border-gray-800 hover:bg-gray-900 text-gray-300">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {movie.thumbnail_url ? (
                          <img src={movie.thumbnail_url} alt={movie.title} className="w-8 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-12 bg-gray-700 rounded" />
                        )}
                        <div>
                          <p className="text-white font-medium">{movie.title}</p>
                          <p className="text-gray-500 text-xs">{movie.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{movie.average_rating?.toFixed(1) || "—"}</td>
                    <td className="px-4 py-3">{movie.view_count}</td>
                    <td className="px-4 py-3 text-xs">{movie.genres?.map((g) => g.name).join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      <label className="cursor-pointer text-gray-400 hover:text-white">
                        <input
                          type="file" accept="image/*" className="hidden"
                          onChange={(e) => handleFileUpload(movie.id, e.target.files[0], "thumbnail")}
                        />
                        {uploadState[movie.id + "thumbnail"] ? "Uploading..." : <FaUpload />}
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <label className="cursor-pointer text-gray-400 hover:text-white">
                        <input
                          type="file" accept="video/*" className="hidden"
                          onChange={(e) => handleFileUpload(movie.id, e.target.files[0], "video")}
                        />
                        {uploadState[movie.id + "video"] ? "Uploading..." : <FaUpload />}
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="text-red-500 hover:text-red-400"
                        aria-label={`Delete ${movie.title}`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600">
                Prev
              </button>
              <span className="text-gray-400 text-sm">Page {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
