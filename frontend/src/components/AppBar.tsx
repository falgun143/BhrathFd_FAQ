import { FaSun, FaMoon } from "react-icons/fa";
import React, { useEffect } from "react";
import { useDarkMode } from "../context/theme";
import { Link, useNavigate } from "react-router-dom";
import { FaBookReader } from "react-icons/fa";
import { useLogin } from "../context/logincontext";

const Appbar = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { login, setLogin, setRole } = useLogin();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setLogin(true);
      setRole(decoded.role);
    }
  }, [setLogin, setRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLogin(false);
    setRole("");
    navigate("/");
  };

  return (
    <>
      <div className="w-full fixed top-0 z-50 bg-[#fff3dc] dark:bg-[#121212] mb-4">
        <div className="w-full h-16 flex justify-between items-center gap-2 px-8">
          <Link to="/" style={{ textDecoration: "none" }}>
            <div className="font-bold text-[18px] cursor-pointer flex items-center p-2 rounded-md text-amber-400 bg-[#121212]">
              <FaBookReader />
            </div>
          </Link>

          <div className="flex items-center justify-center transition-transform duration-200 dark:text-white">
            {login ? (
              <button onClick={handleLogout} className="mx-2">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login">
                  <button className="mx-2">Login</button>
                </Link>
                <Link to="/register">
                  <button className="mx-2">Register</button>
                </Link>
              </>
            )}
            <button onClick={toggleDarkMode} className="text-xl mx-2">
              {isDarkMode ? (
                <FaSun className="text-yellow-500" />
              ) : (
                <FaMoon className="text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <hr className="border-gray-300 dark:border-[#434343]" />
      </div>

      {children}
    </>
  );
};

export default Appbar;
