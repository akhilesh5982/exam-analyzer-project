"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type RecordType = {
  subject: string;
  score: number;
  mistake: string;
};

export default function Home() {
  const { data: session } = useSession(); // ✅ yahan hona chahiye

  const [records, setRecords] = useState<RecordType[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("records");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [mistake, setMistake] = useState("");

  useEffect(() => {
    localStorage.setItem("records", JSON.stringify(records));
  }, [records]);

  const getWeakSubject = () => {
    if (records.length === 0) return "";
    return records.reduce((min, r) => (r.score < min.score ? r : min)).subject;
  };

  const getCommonMistake = () => {
    const freq: any = {};
    records.forEach((r) => {
      if (r.mistake) {
        freq[r.mistake] = (freq[r.mistake] || 0) + 1;
      }
    });

    return Object.keys(freq).reduce((a, b) =>
      freq[a] > freq[b] ? a : b,
    "");
  };

  const getSuggestion = () => {
    const weak = getWeakSubject();
    const mistake = getCommonMistake();
    if (!weak) return "";
    return `Focus more on ${weak}. Avoid: ${mistake}. Practice regularly.`;
  };

  const addRecord = () => {
    if (subject && score) {
      setRecords([
        ...records,
        { subject, score: Number(score), mistake },
      ]);
      setSubject("");
      setScore("");
      setMistake("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Exam Analyzer 📊
      </h1>

      {/* ✅ LOGIN BUTTON */}
      <div className="text-center mb-4">
        {!session ? (
          <button
            onClick={() => signIn()}
            className="bg-green-500 text-white p-2 rounded"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>
        )}
      </div>

      {/* AI Suggestion */}
      <div className="mt-6 max-w-md mx-auto bg-blue-100 p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-2">AI Suggestion 🤖</h2>
        <p>{getSuggestion()}</p>
      </div>

      {/* Input */}
      <div className="bg-white p-6 rounded-2xl shadow-md max-w-md mx-auto">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <input
          type="number"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <textarea
          placeholder="Mistake"
          value={mistake}
          onChange={(e) => setMistake(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={addRecord}
          className="bg-blue-500 text-white w-full p-2 rounded"
        >
          Add Record
        </button>
      </div>

      {/* List */}
      <div className="mt-6 max-w-md mx-auto">
        {records.map((r, i) => (
          <div key={i} className="bg-white p-3 rounded shadow mb-2">
            <div className="flex justify-between">
              <span>{r.subject}</span>
              <span>{r.score}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              ❌ {r.mistake}
            </p>
          </div>
        ))}
      </div>

      {/* Graph */}
      {records.length > 0 && (
        <div className="mt-10 max-w-2xl mx-auto bg-white p-5 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-center">
            Performance Graph 📈
          </h2>

          <LineChart width={500} height={300} data={records}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" />
          </LineChart>
        </div>
      )}
    </div>
  );
}