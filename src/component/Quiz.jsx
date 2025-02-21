import React, { useEffect, useState } from "react";
import questions from "../data/questions.json";
import Timer from "./Timer";
import { Link } from "react-router-dom";
import { openDB } from "idb";

const saveToHistory = async (score, totalQuestions, answers) => {
    const db = await openDB("QuizApp", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("history")) {
                db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
            }
        },
    });
    const formattedAnswers = answers.map((answer) => ({
        question: answer.question,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        correctAnswer: answer.correctAnswer || "N/A",
    }));

    const date = new Date().toISOString();
    await db.add("history", { score, totalQuestions, answers: formattedAnswers, date, });
};


const Quiz = () => {

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState([]);
    const [inputAnswer, setInputAnswer] = useState("");
    const [warning, setWarning] = useState("");
    const [showInstructions, setShowInstructions] = useState(true);
    const [feedback, setFeedback] = useState("");
    const[timeLeft,setTimeLeft]=useState(30);

 useEffect(()=>{
    if (isComplete) {
        saveToHistory(score, questions.length, selectedAnswer);
    }
}, [isComplete]);

        

    const handleTimeOut = () => {
        setFeedback("Time's up!. The quiz has ended.");
        setIsComplete(true);
      };

    const handleAnswer = (answer) => {

        const current = questions[currentQuestion];
        let isCorrect = false;

        setWarning("");
        setFeedback("");

        if (current.type === "multiple-choice" || current.type === "subjective") {
            isCorrect = answer.trim().toLowerCase() === current.correctAnswer.toString().toLowerCase();
        }
        else if (current.type === "integer") {
            const numericAnswer = parseInt(answer, 10);
            if (isNaN(numericAnswer)) {
                setWarning("Please enter a valid number");
                return;
            }
            isCorrect = numericAnswer === current.correctAnswer;

        }
        setSelectedAnswer((prevAnswer) => [...prevAnswer, { question: current.question, answer, isCorrect, correctAnswer: current.correctAnswer, },]);
        if (isCorrect) {
            setScore(score + 1);
            setFeedback("✅ Correct!");
        }
        else {
            setFeedback("❌ Wrong!");
        }
        setTimeout(() => {
            setFeedback("");
            setInputAnswer("");
            if (currentQuestion + 1 < questions.length) {
                setCurrentQuestion(currentQuestion + 1);
            }
            else {
                setIsComplete(true);
            }
        }, 1500);
    }; 
    const restartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer([]);
        setIsComplete(false);
        setInputAnswer("");
        setWarning("");
        setShowInstructions(true);
    };
    const percentage = Math.round((score / questions.length) * 100);


    if (showInstructions) {
        return (
            <div className="p-4 text-center">
                <h1 className="text-3xl font-bold text-yellow-500 mb-4">Instructions</h1>
                <br />
                <ul className="text-lg text-center">
                    <li>1. For multiple-choice questions, select the one best answer (A, B, C, or D).</li>
                    <li>2. For integer-type questions, write your numerical answer clearly.</li>
                    <li>3. No calculators unless specified.</li>
                    <li>4. You have 30 minutes to complete this quiz.</li>
                </ul>
                <br />
                <button
                    onClick={() => setShowInstructions(false)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-yellow-600 transition duration-300">
                    Start Quiz
                </button>
            </div>
        );
    }
    return (
        <div className="min-h-screen p-4 bg-gray-100">
            <Link to="/History" className="bg-yellow font bold ">View History</Link>
            {isComplete ? (
                <div className="text-center">
                    <h1 className="text-xl font-bold">Quiz Completed</h1>
                    <br />
                    <p>Your Score: {score}/{questions.length}</p>
                    <br />
                    <div className="relative w-24 h-24 mx-auto mt-4 ">
                        <svg
                            className="transform-rotate-90"
                            width="100%"
                            height="100%"
                            viewBox="0 0 36 36">

                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                stroke={percentage >= 75 ? "green" : percentage >= 50 ? "yellow" : "red"}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="100"
                                strokeDashoffset={100 - percentage}
                                style={{
                                    transition: "stroke-dashoffset 1s ease-out",
                                }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-700">
                            {percentage}%
                        </div>
                    </div>
                    <br />
                    <button
                        onClick={restartQuiz} className="bg-yellow-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-yellow-600 transition duration-300">
                        Restart Quiz
                    </button>
                </div>
            ) : (
                <div>
                    <h1 className="text-xl font-bold">Question {currentQuestion + 1}/{questions.length}</h1>
                    <Timer seconds={1800} onTimeUp={handleTimeOut} />
                    <p className="mt-2">{questions[currentQuestion]?.question}</p>
                    {questions[currentQuestion].type === "multiple-choice" ? (

                        <div className="mt-4">
                            {questions[currentQuestion]?.options?.map((option, index) => {
                                const isAnswered = selectedAnswer.length > currentQuestion;
                                const isCorrect = option === questions[currentQuestion].correctAnswer;
                                const isUserAnswer = selectedAnswer[currentQuestion]?.answer === option;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isComplete}
                                        className={`block w-full p-2 rounded my-2 text-left ${isComplete
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gray-500 hover:bg-gray-600 text-white"
                                            }`}>

                                        {String.fromCharCode(65 + index)}.{" "}{option}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-4">
                            <input type="text"
                                placeholder="Type your answer here"
                                value={inputAnswer}
                                onChange={(e) => setInputAnswer(e.target.value)}
                                onKeyDown={(e) => {
                                    if (!isComplete && e.key === "Enter") handleAnswer(e.target.value);
                                }}
                                className="w-full p-2 border rounded"
                                disabled={isComplete} />
                            {warning && (
                                <p className="text-red-500 mt-2">{warning}</p>
                            )}
                            <br />
                            <br />
                            <button
                                onClick={() => handleAnswer(inputAnswer)}
                                className="bg-yellow-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-yellow-600 transition duration-300"
                                disabled={isComplete}
                                >
                                Submit Answer
                            </button>
                        </div>
                    )}
                    {feedback && <p className="mt-4 text-lg font-bold">{feedback}</p>}
                </div>
            )}
        </div>
    );
};

export default Quiz;



