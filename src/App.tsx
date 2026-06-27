import { useState } from "react";
import { BootScreen } from "./components/BootScreen/BootScreen";
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
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
