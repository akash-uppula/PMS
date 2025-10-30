import React, { useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="bg-light text-dark pt-5 pb-4 border-top">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-md-3">
            <h2 className="fw-bold text-primary">Akash Uppula</h2>
            <p className="small mt-2 mb-0">
              © {new Date().getFullYear()} All rights reserved.
            </p>
            <div className="d-flex gap-3 fs-4 mt-3">
              <a
                href="https://github.com/akash-uppula/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-dark hover-opacity transition-all"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/akash-uppula/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-dark hover-opacity transition-all"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-dark hover-opacity transition-all"
              >
                <FaTwitter />
              </a>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <h5 className="text-primary fw-semibold mb-3">About</h5>
            <ul className="list-unstyled small">
              {["Our Story", "Team", "Careers", "Blog"].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-decoration-none text-dark d-block py-1 link-hover"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h5 className="text-primary fw-semibold mb-3">Resources</h5>
            <ul className="list-unstyled small">
              {["Docs", "API Reference", "Community", "Tutorials"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-decoration-none text-dark d-block py-1 link-hover"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h5 className="text-primary fw-semibold mb-3">Support</h5>
            <ul className="list-unstyled small">
              {["Help Center", "Contact Us", "FAQs", "Privacy Policy"].map(
                (item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-decoration-none text-dark d-block py-1 link-hover"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-top pt-3 mt-4 text-center small text-muted">
          Built with ❤️ using React & Bootstrap
        </div>
      </div>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary position-fixed bottom-0 end-0 m-4 shadow-lg d-flex align-items-center justify-content-center"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            transition: "all 0.3s ease-in-out",
            opacity: showScroll ? 1 : 0,
          }}
          aria-label="Scroll to top"
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </footer>
  );
};

export default Footer;
