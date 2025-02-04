import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../context/logincontext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setLogin, setRole } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setLogin(true);
      setRole(response.data.role);
      navigate('/faq');
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setError(error.response.data.errors.map((err: any) => err.msg).join(", "));
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f4ea] dark:bg-[#121212] text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded shadow-md">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
              {"Invalid Credentials"}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
            <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
