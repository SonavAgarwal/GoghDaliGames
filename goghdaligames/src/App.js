import "./reset.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Play from "./pages/Play";
import Fireball from "./pages/fireball/Fireball";
import { ContextProvider } from "./api/ConnectionContext";
import PlayConnect from "./pages/PlayConnect";
import PlayInvite from "./pages/PlayInvite";
import Lobby from "./pages/fireball/Lobby";

function App() {
    return (
        <ContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Play />} />
                    <Route path="play/:roomID" element={<PlayConnect />} />
                    {/* <Route path="fb" element={<Play />} /> */}
                    <Route path="fb/:roomID" element={<Fireball />} />
                    <Route path="lobby/:roomID" element={<Lobby />} />
                    <Route path="pi/:roomID" element={<PlayInvite />} />
                </Routes>
            </BrowserRouter>
        </ContextProvider>
    );
}

export default App;
