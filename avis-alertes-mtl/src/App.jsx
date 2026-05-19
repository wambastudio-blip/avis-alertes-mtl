import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Accueil from "./pages/Accueil";
import Detail from "./pages/Detail";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/alertes/:id" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
