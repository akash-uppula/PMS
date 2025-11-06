import React from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaChartBar,
  FaTags,
  FaUsers,
  FaCogs,
  FaShieldAlt,
} from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const handleScroll = (e) => {
  e.preventDefault();
  const target = document.getElementById("features");
  if (!target) return;
  const yOffset = -80;
  const y =
    target.getBoundingClientRect().top + window.pageYOffset + yOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
};

  const features = [
    {
      icon: <FaBox size={40} />,
      title: "Product Tracking",
      desc: "Add, update, and organize your products efficiently.",
    },
    {
      icon: <FaChartBar size={40} />,
      title: "Analytics & Reports",
      desc: "Gain insights into sales trends, stock levels, and performance metrics.",
    },
    {
      icon: <FaTags size={40} />,
      title: "Category Management",
      desc: "Organize products into categories for better inventory control.",
    },
    {
      icon: <FaUsers size={40} />,
      title: "Team Collaboration",
      desc: "Manage your team, assign roles, and track performance seamlessly.",
    },
    {
      icon: <FaCogs size={40} />,
      title: "Customizable Workflow",
      desc: "Adapt the system to your business processes and automate repetitive tasks.",
    },
    {
      icon: <FaShieldAlt size={40} />,
      title: "Secure & Reliable",
      desc: "Enterprise-grade security to keep your data safe.",
    },
  ];

  const whyChoose = [
    {
      emoji: "⚡",
      title: "Fast & Efficient",
      desc: "Optimize processes and save valuable time.",
    },
    {
      emoji: "🔒",
      title: "Secure Data",
      desc: "Your product and inventory data is protected with top security standards.",
    },
    {
      emoji: "📊",
      title: "Insightful Reports",
      desc: "Make smarter business decisions with real-time analytics.",
    },
  ];

  return (
    <div className="min-vh-100 bg-light">
      <section className="d-flex align-items-center py-5">
        <div className="container text-center px-4">
          <h1 className="mb-3 fw-bold">
            Product Management <span className="text-primary">System</span>
          </h1>
          <p className="mb-4 text-muted">
            Manage your products, categories, and inventory efficiently.
            Streamline operations and scale your business effortlessly.
          </p>
          <button className="btn btn-primary px-4 py-2" onClick={handleScroll}>
            Explore Features
          </button>
        </div>
      </section>

      <section className="py-5" id="features">
        <div className="container">
          <div className="row g-4 text-center">
            {features.map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="card-custom h-100 p-4">
                  <div className="mb-3 text-primary">{feature.icon}</div>
                  <h5 className="fw-semibold">{feature.title}</h5>
                  <p className="text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="text-primary mb-3 fw-bold">Why Choose Our System?</h2>
          <p className="mb-4 text-muted">
            Whether small or large enterprise, our system empowers you to work
            smarter. Automate workflows, gain real-time insights, and grow
            efficiently.
          </p>
          <div className="row g-4 mt-4">
            {whyChoose.map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="card-custom h-100 p-4">
                  <div className="fs-1 text-primary mb-2">{item.emoji}</div>
                  <h5 className="fw-semibold">{item.title}</h5>
                  <p className="text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h2 className="mb-3 fw-bold">Ready to Manage Your Products?</h2>
          <p className="mb-4">
            Sign up today and streamline your product management effortlessly.
          </p>
          <Link to="/login" className="btn btn-light px-4 py-2 fw-semibold">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
