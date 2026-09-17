import { HashRouter, Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import PresenterView from "./views/PresenterView";
import BoardView from "./views/BoardView";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/presentador" element={<PresenterView />} />
        <Route path="/tablero" element={<BoardView />} />
      </Routes>
    </HashRouter>
  );
}
