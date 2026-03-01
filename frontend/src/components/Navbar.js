import { useEffect, useState } from "react";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="logo">Explainable Multimodal AI</div>
      <div className="nav-links">
        <button onClick={() => scrollTo("home")}>Home</button>
        <button onClick={() => scrollTo("guide")}>Guide</button>
        <button onClick={() => scrollTo("try")}>Try Now</button>
        <button onClick={() => scrollTo("contact")}>Contact</button>
      </div>
    </nav>
  );
}

export default Navbar;