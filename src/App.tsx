import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import CyberBackground from "./components/CyberBackground/CyberBackground";
import Topbar from "./components/Topbar/Topbar";
import { AnimatePresence } from "framer-motion";

import { GameBase } from "./pages/GameBase/GameBase";
import GamePage from "./pages/GameBase/GamePage";

import GameCopyPage from "./pages/GameCopy/GameCopyPage";
import GameCopyDetailPage from "./pages/GameCopy/GameCopyDetailPage";
import Profile from "./pages/Profile/Profile";
import UsersPage from "./pages/Users/UsersPage";
import PlatformsPage from "./pages/Platforms/PlatformsPage";
import RequireAdmin from "./components/RequireAdmin/RequireAdmin";

const AdminLayout = lazy(() => import("./components/AdminLayout/AdminLayout"));
const AdminGameBasesPage = lazy(() => import("./pages/Admin/AdminGameBasesPage"));
const AdminUsersPage = lazy(() => import("./pages/Admin/AdminUsersPage"));
const AdminGenresPage = lazy(() => import("./pages/Admin/AdminGenresPage"));
const AdminThemesPage = lazy(() => import("./pages/Admin/AdminThemesPage"));
const AdminGameModesPage = lazy(() => import("./pages/Admin/AdminGameModesPage"));
const AdminPlayerPerspectivesPage = lazy(() => import("./pages/Admin/AdminPlayerPerspectivesPage"));
const AdminPlatformsPage = lazy(() => import("./pages/Admin/AdminPlatformsPage"));
const AdminConditionsPage = lazy(() => import("./pages/Admin/AdminConditionsPage"));

function App() {
  const location = useLocation();
 /* const [booted, setBooted] = useState(false);

  if (!booted) {
    return <BootScreen onFinish={() => setBooted(true)} />;
  }*/

  return (
    <>

     <CyberBackground />
      {location.pathname !== '/' && <Topbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/gamebase" element={<GameBase />} />
          <Route path="/gamebase/:id" element={<GamePage />} />
          <Route path="/gamecopy" element={<GameCopyPage />} />
          <Route path="/gamecopy/:id" element={<GameCopyDetailPage />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/platforms" element={<PlatformsPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Suspense fallback={<div>LOADING...</div>}>
                  <AdminLayout />
                </Suspense>
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="game-bases" replace />} />
            <Route path="game-bases" element={<AdminGameBasesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="genres" element={<AdminGenresPage />} />
            <Route path="themes" element={<AdminThemesPage />} />
            <Route path="game-modes" element={<AdminGameModesPage />} />
            <Route path="player-perspectives" element={<AdminPlayerPerspectivesPage />} />
            <Route path="platforms" element={<AdminPlatformsPage />} />
            <Route path="conditions" element={<AdminConditionsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
