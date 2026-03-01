import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import TryNow from "./pages/TryNow";
import Contact from "./pages/Contact";

function App() {
  return (
    <>
      <Navbar />
      <div id="home"><Home /></div>
      <div id="guide"><Guide /></div>
      <div id="try"><TryNow /></div>
      <div id="contact"><Contact /></div>
    </>
  );
}

export default App;