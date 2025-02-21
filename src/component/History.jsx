import React, { useEffect, useState } from "react";
import { openDB } from "idb";

const History = () => {
  const [history, setHistory] = useState([]); 
  const [selectedAttempt, setSelectedAttempt] = useState(null); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const db = await openDB("QuizApp", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("history")) {
              db.createObjectStore("history", {
                keyPath: "id",
                autoIncrement: true,
              });
            }
          },
        });
        const data = await db.getAll("history");
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to fetch quiz history");
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-center mb-4">Quiz History</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : history.length === 0 ? (
        <p>No history available.</p>
      ) : selectedAttempt ? (
       
        <div>
          <h2 className="text-lg font-bold mb-4">Review Your Answers</h2>
          <ul className="space-y-3">
            {selectedAttempt.answers.map((answer, index) => (
              <li
                key={index}
                className="p-4 border rounded shadow-md bg-gray-50"
              >
                <p className="font-bold">{answer.question}</p>
                <p>
                  Your Answer: {answer.answer}{" "}
                  {answer.isCorrect
                    ? "(Correct)"
                    : `(Incorrect, Correct Answer: ${answer.correctAnswer})`}
                </p>
              </li>
            ))}
          </ul>
          <br />
          
          <button
            onClick={() => setSelectedAttempt(null)}
            className="bg-yellow-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-yellow-600 transition duration-300"
          >
            Back to History
          </button>
        </div>
      ) : (
       
        <ul className="space-y-4">
          {history.map((attempt, index) => (
            <li
              key={attempt.id || index}
              className="p-4 border rounded shadow-md cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedAttempt(attempt)}
            >
              <p className="font-bold">Attempt {index + 1}</p>
              <p>
                Score: {attempt.score}/{attempt.totalQuestions}
              </p>
              <p>Date: {new Date(attempt.date).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
