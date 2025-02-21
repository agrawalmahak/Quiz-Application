const QuestionHandler = ({ question, type, handleAnswer }) => {
    return type === "multiple-choice" ? (
      question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleAnswer(option)}
          className="block w-full p-2 rounded my-2 text-left bg-gray-200 hover:bg-gray-300"
        >
          {String.fromCharCode(65 + index)}. {option}
        </button>
      ))
    ) : (
      <div>
        <input
          type="text"
          placeholder="Enter your answer"
          className="p-2 border rounded"
          onKeyDown={(e) => e.key === "Enter" && handleAnswer(e.target.value)}
        />
      </div>
    );
  };
  
  export default QuestionHandler;
  