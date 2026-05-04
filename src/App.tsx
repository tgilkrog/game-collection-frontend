import { useState } from "react";
import { BootScreen } from "./components/BootScreen/BootScreen";
import { Routes, Route, useLocation } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Genre } from "./pages/Genre/Genre";
import { Navbar } from "./components/Navbar/Navbar";
import { AnimatePresence } from "framer-motion";

import { GameBase } from "./pages/GameBase/GameBase";
import GamePage from "./pages/GameBase/GamePage";

function App() {
  const location = useLocation();
  const [booted, setBooted] = useState(false);

  if (!booted) {
    return <BootScreen onFinish={() => setBooted(true)} />;
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/genre" element={<Genre />} />
          <Route path="/gamebase" element={<GameBase />} />
          <Route path="/gamebase/:id" element={<GamePage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
