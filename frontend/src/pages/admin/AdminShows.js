import React, { useEffect, useState } from "react";
import { showsAPI } from "../../api/shows";
import { genresAPI } from "../../api/genres";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import "./Admin.css";
import { FaTrash, FaUpload, FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";

export default function AdminShows() {
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [expandedShow, setExpandedShow] = useState(null);
  const [seasons, setSeasons] = useState({});
  const [episodes, setEpisodes] = useState({});
  const [seasonForm, setSeasonForm] = useState({ show_id: "", season_number: 1, title: "" });
  const [episodeForm, setEpisodeForm] = useState({ season_id: "", episode_number: 1, title: "" });
  const [form, setForm] = useState({
    title: "", slug: "", description: "", language: "",
    maturity_rating: "PG-13", is_featured: false, is_trending: false, genre_ids: [],
  });

  useEffect(() => {
    loadShows();
    genresAPI.getAll().then((r) => setGenres(r.data)).catch(() => {});
  }, [page]);

  const loadShows = async () => {
    setLoading(true);
    try {
      const res = await showsAPI.getAll({ page, page_size: 15 });
      setShows(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await showsAPI.create(form);
      toast.success("Show created");
      setShowForm(false);
      loadShows();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this show?")) return;
    try {
      await showsAPI.delete(id);
      toast.success("Deleted");
      loadShows();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const loadSeasons = async (showId) => {
    if (seasons[showId]) return;
    const res = await showsAPI.getSeasons(showId);
    setSeasons((s) => ({ ...s, [showId]: res.data }));
  };

  const loadEpisodes = async (seasonId) => {
    if (episodes[seasonId]) return;
    const res = await showsAPI.getEpisodes(seasonId);
    setEpisodes((e) => ({ ...e, [seasonId]: res.data }));
  };

  const toggleShow = (showId) => {
    if (expandedShow === showId) {
      setExpandedShow(null);
    } else {
      setExpandedShow(showId);
      loadSeasons(showId);
    }
  };

  const handleAddSeason = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shows/seasons", seasonForm);
      toast.success("Season added");
      setSeasons((s) => ({ ...s, [seasonForm.show_id]: null }));
      loadSeasons(seasonForm.show_id);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shows/episodes", episodeForm);
      toast.success("Episode added");
      setEpisodes((ep) => ({ ...ep, [episodeForm.season_id]: null }));
      loadEpisodes(episodeForm.season_id);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const handleEpisodeVideoUpload = async (episodeId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/shows/episodes/${episodeId}/video`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Episode video uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 pb-16 px-6 md:px-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-3xl font-bold">Manage Shows</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-netflix-red text-white px-5 py-2 rounded font-medium hover:bg-red-700"
        >
          {showForm ? "Cancel" : "+ Add Show"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Title *</label>
            <input required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="Show title"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Slug *</label>
            <input required value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
              aria-label="Slug"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs block mb-1">Description</label>
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-netflix-red resize-none"
              aria-label="Description"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Language</label>
            <input value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm outline-none"
              aria-label="Language"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <label key={g.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="accent-netflix-red"
                    checked={form.genre_ids.includes(g.id)}
                    onChange={(e) => {
                      if (e.target.checked) setForm({ ...form, genre_ids: [...form.genre_ids, g.id] });
                      else setForm({ ...form, genre_ids: form.genre_ids.filter((id) => id !== g.id) });
                    }}
                  />
                  <span className="text-gray-300 text-xs">{g.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-netflix-red text-white px-6 py-2.5 rounded font-medium hover:bg-red-700">
              Create Show
            </button>
          </div>
        </form>
      )}

      {loading ? <Spinner /> : (
        <div className="space-y-2">
          {shows.map((show) => (
            <div key={show.id} className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleShow(show.id)} className="text-white hover:text-gray-300">
                    {expandedShow === show.id ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {show.thumbnail_url && (
                    <img src={show.thumbnail_url} alt={show.title} className="w-8 h-12 object-cover rounded" />
                  )}
                  <div>
                    <p className="text-white font-medium">{show.title}</p>
                    <p className="text-gray-500 text-xs">{show.status} · {show.view_count} views</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer text-gray-400 hover:text-white" title="Upload thumbnail">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const fd = new FormData();
                        fd.append("file", e.target.files[0]);
                        await api.post(`/shows/${show.id}/thumbnail`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                        toast.success("Thumbnail uploaded");
                        loadShows();
                      }}
                    />
                    <FaUpload />
                  </label>
                  <button onClick={() => handleDelete(show.id)} className="text-red-500 hover:text-red-400" aria-label="Delete show">
                    <FaTrash />
                  </button>
                </div>
              </div>

              {expandedShow === show.id && (
                <div className="border-t border-gray-700 px-5 py-4 space-y-6">
                  {/* Add Season */}
                  <div>
                    <h4 className="text-gray-300 font-semibold text-sm mb-3">Add Season</h4>
                    <form onSubmit={handleAddSeason} className="flex gap-3 flex-wrap">
                      <input type="hidden" value={show.id}
                        onChange={() => setSeasonForm({ ...seasonForm, show_id: show.id })}
                      />
                      <input type="number" min="1" placeholder="Season #" value={seasonForm.season_number}
                        onFocus={() => setSeasonForm({ ...seasonForm, show_id: show.id })}
                        onChange={(e) => setSeasonForm({ ...seasonForm, season_number: parseInt(e.target.value), show_id: show.id })}
                        className="w-24 bg-gray-800 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
                        aria-label="Season number"
                      />
                      <input type="text" placeholder="Title (optional)" value={seasonForm.title}
                        onChange={(e) => setSeasonForm({ ...seasonForm, title: e.target.value, show_id: show.id })}
                        className="flex-1 bg-gray-800 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
                        aria-label="Season title"
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
                        Add Season
                      </button>
                    </form>
                  </div>

                  {/* Seasons & Episodes */}
                  {seasons[show.id]?.map((season) => (
                    <div key={season.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-medium">Season {season.season_number} {season.title ? `— ${season.title}` : ""}</h5>
                        <button onClick={() => loadEpisodes(season.id)} className="text-gray-400 text-xs hover:text-white">
                          Load Episodes
                        </button>
                      </div>

                      {/* Add Episode */}
                      <form onSubmit={handleAddEpisode} className="flex gap-3 flex-wrap mb-3">
                        <input type="number" min="1" placeholder="Ep #"
                          value={episodeForm.season_id === season.id ? episodeForm.episode_number : ""}
                          onFocus={() => setEpisodeForm({ ...episodeForm, season_id: season.id })}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: parseInt(e.target.value), season_id: season.id })}
                          className="w-20 bg-gray-800 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
                          aria-label="Episode number"
                        />
                        <input type="text" placeholder="Episode title" required
                          value={episodeForm.season_id === season.id ? episodeForm.title : ""}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value, season_id: season.id })}
                          className="flex-1 bg-gray-800 text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-netflix-red"
                          aria-label="Episode title"
                        />
                        <button type="submit" className="bg-green-700 text-white px-4 py-1.5 rounded text-sm hover:bg-green-600">
                          <FaPlus className="inline mr-1" />Add Ep
                        </button>
                      </form>

                      {/* Episode list */}
                      {episodes[season.id]?.map((ep) => (
                        <div key={ep.id} className="flex items-center justify-between py-2 border-t border-gray-700">
                          <span className="text-gray-300 text-sm">E{ep.episode_number} — {ep.title}</span>
                          <label className="cursor-pointer text-gray-400 hover:text-white text-xs flex items-center gap-1">
                            <input type="file" accept="video/*" className="hidden"
                              onChange={(e) => handleEpisodeVideoUpload(ep.id, e.target.files[0])}
                            />
                            <FaUpload className="text-xs" /> Upload Video
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600">Prev</button>
          <span className="text-gray-400 text-sm">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40 hover:bg-gray-600">Next</button>
        </div>
      )}
    </div>
  );
}
