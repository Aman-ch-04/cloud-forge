import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginCard, setShowLoginCard] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // API feedback
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const images = ["./1st crop.jpg", "./crop 2.png", "./crop3.webp"];

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setMessage("");
  };

  // ⭐ Floating Image Component
  function FloatingImage() {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="floating-image-box">
        <img src={images[currentImage]} alt="hero" />
        <div className="floating-tag">cropx</div>
      </div>
    );
  }

  // ⭐ Hero Content Component
  function HeroContent() {
    return (
      <div className="hero-content">
        <h1 className="hero-title">Get Personalized Crop Recommendations Instantly</h1>
        <p className="hero-subtitle">Your Soil, Your Climate, Your Perfect Crop</p>

        <div className="hero-search-box">
          <button className="hero-search-btn" onClick={() => setShowLoginCard(true)}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // ⭐ HANDLE SUBMIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Signup validation
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = isLogin
      ? { email, password }
      : { name, email, password };

    const url = isLogin
      ? "http://54.221.59.137:5000/login"
      : "http://54.221.59.137:5000/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (isLogin) {
        // Save JWT token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful!");

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        setMessage("Signup successful!");
        setIsLogin(true);
      }
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div className="login-page">
      {/* LEFT */}
      <div className="hero-section">
        <HeroContent />
        <FloatingImage />
      </div>

      {/* RIGHT — LOGIN CARD */}
      {showLoginCard && (
        <div className="login-card">
          <div className="tab-buttons">
            <button
              className={isLogin ? "active" : "inactive"}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : "inactive"}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          {/* Info / Error */}
          {error && <p className="error-msg">{error}</p>}
          {message && <p className="success-msg">{message}</p>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? "Login" : "Signup"}
            </button>
          </form>

          <div className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleForm}>{isLogin ? "Signup" : "Login"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
