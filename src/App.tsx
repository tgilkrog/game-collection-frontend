import { useState } from "react";
import { BootScreen } from "./components/BootScreen/BootScreen";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { About } from "./pages/About";
import { Navbar } from "./components/Navbar/Navbar";

function App() {
  const [booted, setBooted] = useState(false);

  if (!booted) {
    return <BootScreen onFinish={() => setBooted(true)} />;
  }

  if (!booted) {
    return <BootScreen onFinish={() => setBooted(true)} />;
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
