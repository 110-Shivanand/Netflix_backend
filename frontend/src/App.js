// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import { AuthProvider } from "./context/AuthContext";
// import { WatchlistProvider } from "./context/WatchlistContext";

// // Layouts
// import MainLayout from "./layouts/MainLayout";
// import AdminLayout from "./layouts/AdminLayout";

// // Route Guards
// import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";

// // Pages
// import Home from "./pages/Home";
// import Movies from "./pages/Movies";
// import Shows from "./pages/Shows";
// import MovieDetail from "./pages/MovieDetail";
// import ShowDetail from "./pages/ShowDetail";
// import WatchMovie from "./pages/WatchMovie";
// import WatchEpisode from "./pages/WatchEpisode";
// import Watchlist from "./pages/Watchlist";
// import Search from "./pages/Search";
// import Profile from "./pages/Profile";

// // Auth Pages
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import ResetPassword from "./pages/auth/ResetPassword";
// import VerifyEmail from "./pages/auth/VerifyEmail";

// // Admin Pages
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminMovies from "./pages/admin/AdminMovies";
// import AdminShows from "./pages/admin/AdminShows";
// import AdminGenres from "./pages/admin/AdminGenres";
// import AdminUsers from "./pages/admin/AdminUsers";
// import AdminAnalytics from "./pages/admin/AdminAnalytics";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <WatchlistProvider>
//           <Toaster
//             position="top-right"
//             toastOptions={{
//               style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
//               success: { iconTheme: { primary: "#E50914", secondary: "#fff" } },
//             }}
//           />
//           <Routes>
//             {/* Public auth routes */}
//             <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
//             <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="/verify-email" element={<VerifyEmail />} />

//             {/* Watch pages — no footer/navbar */}
//             <Route path="/watch/movie/:movieId" element={<ProtectedRoute><WatchMovie /></ProtectedRoute>} />
//             <Route path="/watch/episode/:episodeId" element={<ProtectedRoute><WatchEpisode /></ProtectedRoute>} />

//             {/* Admin routes */}
//             <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
//               <Route index element={<AdminDashboard />} />
//               <Route path="movies" element={<AdminMovies />} />
//               <Route path="shows" element={<AdminShows />} />
//               <Route path="genres" element={<AdminGenres />} />
//               <Route path="users" element={<AdminUsers />} />
//               <Route path="analytics" element={<AdminAnalytics />} />
//             </Route>

//             {/* Main app routes */}
//             <Route element={<MainLayout />}>
//               <Route path="/" element={<Home />} />
//               <Route path="/movies" element={<Movies />} />
//               <Route path="/movies/:slug" element={<MovieDetail />} />
//               <Route path="/shows" element={<Shows />} />
//               <Route path="/shows/:slug" element={<ShowDetail />} />
//               <Route path="/search" element={<Search />} />
//               <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
//               <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
//               <Route path="*" element={
//                 <div className="min-h-screen flex items-center justify-center bg-netflix-dark">
//                   <div className="text-center">
//                     <h1 className="text-netflix-red text-8xl font-bold mb-4">404</h1>
//                     <p className="text-white text-2xl mb-6">Page not found</p>
//                     <a href="/" className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200">
//                       Go Home
//                     </a>
//                   </div>
//                 </div>
//               } />
//             </Route>
//           </Routes>
//         </WatchlistProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }



import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Shows from "./pages/Shows";
import MovieDetail from "./pages/MovieDetail";
import ShowDetail from "./pages/ShowDetail";
import WatchMovie from "./pages/WatchMovie";
import WatchEpisode from "./pages/WatchEpisode";
import Watchlist from "./pages/Watchlist";
import Search from "./pages/Search";
import Profile from "./pages/Profile";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMovies from "./pages/admin/AdminMovies";
import AdminShows from "./pages/admin/AdminShows";
import AdminGenres from "./pages/admin/AdminGenres";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid #333",
              },
              success: {
                iconTheme: {
                  primary: "#E50914",
                  secondary: "#fff",
                },
              },
            }}
          />

          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Watch Routes */}
            <Route
              path="/watch/movie/:movieId"
              element={<WatchMovie />}
            />
            <Route
              path="/watch/episode/:episodeId"
              element={<WatchEpisode />}
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="shows" element={<AdminShows />} />
              <Route path="genres" element={<AdminGenres />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:slug" element={<MovieDetail />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/shows/:slug" element={<ShowDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/profile" element={<Profile />} />

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-netflix-dark">
                    <div className="text-center">
                      <h1 className="text-netflix-red text-8xl font-bold mb-4">
                        404
                      </h1>
                      <p className="text-white text-2xl mb-6">
                        Page not found
                      </p>
                      <a
                        href="/"
                        className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}