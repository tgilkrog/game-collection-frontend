import { Routes, Route, useLocation } from "react-router-dom";
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
import AdminGameBasesPage from "./pages/Admin/AdminGameBasesPage";
import RequireAdmin from "./components/RequireAdmin/RequireAdmin";

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
          <Route path="/admin/game-bases" element={<RequireAdmin><AdminGameBasesPage /></RequireAdmin>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
