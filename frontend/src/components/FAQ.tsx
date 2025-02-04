import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../context/logincontext";

const FAQ: React.FC = () => {
  interface Faq {
    id: number;
    question: string;
    answer: string;
  }

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [lang, setLang] = useState("en");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, role } = useLogin();

  useEffect(() => {
    if (login) {
      fetchFaqs();
    } else {
      navigate("/login");
    }
  }, [login, lang, navigate]);

  const fetchFaqs = async () => {
    const response = await axios.get(
      `http://localhost:8000/api/faqs?lang=${lang}`
    );
    setFaqs(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editId !== null) {
        const response = await axios.put(
          `http://localhost:8000/api/faqs/${editId}`,
          { question, answer },
          config
        );
        setFaqs(faqs.map((faq) => (faq.id === editId ? response.data : faq)));
        setEditId(null);
      } else {
        const response = await axios.post(
          "http://localhost:8000/api/faqs",
          { question, answer },
          config
        );
        setFaqs([...faqs, response.data]);
      }
      setQuestion("");
      setAnswer("");
      setError(null);
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setError(error.response.data.errors.map((err: any) => err.msg).join(", "));
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleEdit = (faq: Faq) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`http://localhost:8000/api/faqs/${id}`, config);
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  if (!login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f4ea] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Please log in to see FAQs</h2>
          <Link to="/login" className="text-blue-500 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="faq-container flex flex-col mt-[70px] bg-[#f9f4ea] dark:bg-gray-900 min-h-screen">
      <div className="fixed top-0 left-0 w-full bg-[#fff3dc] dark:bg-gray-900 p-4 z-50 mt-14 ">
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Select Language:
        </label>
        <select
          onChange={(e) => setLang(e.target.value)}
          value={lang}
          className="p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="bn">Bengali</option>
        </select>
      </div>
      <div className="mt-28">
        {faqs.length > 0 ? (
          <ul className="p-4" >
            {faqs.map((faq: any) => (
              <li
                key={faq.id}
                className="mb-4 p-4 bg-[#f9e8c5] hover:bg-[#ffdd9a] dark:hover:bg-slate-950 dark:bg-gray-800 cursor-pointer  shadow hover:shadow-lg transition-shadow duration-300 rounded-2xl"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                {role == "admin" && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            No FAQs available. Please add a new FAQ.
          </p>
        )}
        {(role == "user" || (role == "admin" && editId !== null)) && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 bg-[#f9f4ea] dark:bg-gray-800 p-4 rounded shadow"
          >
            {error && (
              <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
                {"Question and answer must be at least 5 characters"}
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Question:
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Answer:
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editId !== null ? "Update FAQ" : "Add FAQ"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FAQ;
