import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authThunks";
import { Navigate } from "react-router-dom";
import Footer from "../components/ui/Footer";

export default function Login() {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    username: "",
    password: "",
    organization: "YPP",
  });

  // === Avatar State ===
  const [isTyping, setIsTyping] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0); // untuk run1, run2
  const typingTimer = useRef(null);

  const runFrames = ["/run1.png", "/run2.png"];

  if (token) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // User mengetik → aktifkan animasi
    setIsTyping(true);

    // Ganti frame setiap ketikan
    setFrameIndex((prev) => (prev + 1) % runFrames.length);

    // Reset timer (kembali idle jika berhenti 500ms)
    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      email: `${form.username}@mail.com`,
      password: form.password,
      organization: form.organization,
    };

    dispatch(loginUser(payload));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-base-200">
      {/* CONTENT */}
      <div className="flex flex-1 items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            {/* AVATAR */}
            <div className="flex justify-center mb-2">
              <img
                src={isTyping ? runFrames[frameIndex] : "/idle.png"}
                alt="Avatar"
                className="w-32 h-32 object-contain"
              />
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              Work Order YPPG
            </h2>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input input-bordered w-full"
                onChange={handleChange}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input input-bordered w-full"
                onChange={handleChange}
              />
              <select
                name="organization"
                className="select select-bordered w-full"
                value={form.organization}
                onChange={handleChange}
              >
                <option value="YPP">YPP</option>
                <option value="GD">GD</option>
                <option value="EEE">EEE</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER SELALU DI BAWAH */}
      <Footer />
    </div>
  );
}
