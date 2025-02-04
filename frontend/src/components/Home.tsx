import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../context/logincontext";

const Home: React.FC = () => {
  const { login } = useLogin();

  return (
    <div className="flex flex-col items-center mt-20 mx-auto gap-4 dark:bg-[#121212]">
      <h1 className="dark:text-white font-bold text-[75px] max-w-[600px] leading-18 text-center">
        Frequently asked{" "}
        <span className="text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-transparent bg-clip-text">
          questions
        </span>{" "}
      </h1>
      <p className="text-center max-w-[400px] text-gray-600">
        Do you need some help with something or do you have questions?{" "}
        {!login ? (
          <span>
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-300 hover:text-blue-800"
            >
              Login
            </Link>{" "}
            or{" "}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-300 hover:text-blue-800"
            >
              Register
            </Link>
            .
          </span>
        ) : (
          <Link
            to="/faq"
            className="text-blue-600 dark:text-blue-300 hover:text-blue-800"
          >
            Check FAQ's
          </Link>
        )}
      </p>
    </div>
  );
};

export default Home;
