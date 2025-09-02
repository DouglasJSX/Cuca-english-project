import { useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function MultipleChoice({
  content,
  onChange,
  mode = "editor",
  onComplete,
  showOverview = false,
}) {
  const [questions, setQuestions] = useState(
    content?.questions || [
      {
        question: "",
        questionImage: null,
        options: ["", "", "", ""],
        correct: 0,
      },
    ]
  );

  const updateContent = (newQuestions) => {
    setQuestions(newQuestions);
    if (onChange) {
      onChange({ questions: newQuestions });
    }
  };

  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        question: "",
        questionImage: null,
        options: ["", "", "", ""],
        correct: 0,
      },
    ];
    updateContent(newQuestions);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    const newQuestions = questions.filter((_, i) => i !== index);
    updateContent(newQuestions);
  };

  const updateQuestion = (questionIndex, field, value) => {
    const newQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        return { ...q, [field]: value };
      }
      return q;
    });
    updateContent(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    updateContent(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = questions.map((q, i) => {
      if (i === questionIndex) {
        return { ...q, options: [...q.options, ""] };
      }
      return q;
    });
    updateContent(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = questions.map((q, i) => {
      if (i === questionIndex && q.options.length > 2) {
        const newOptions = q.options.filter((_, oi) => oi !== optionIndex);
        return {
          ...q,
          options: newOptions,
          correct:
            q.correct >= optionIndex && q.correct > 0
              ? q.correct - 1
              : q.correct,
        };
      }
      return q;
    });
    updateContent(newQuestions);
  };

  if (mode === "player") {
    return (
      <MultipleChoicePlayer questions={questions} onComplete={onComplete} showOverview={showOverview} />
    );
  }

  if (mode === "preview") {
    return (
      <MultipleChoicePlayer questions={questions} onComplete={() => {}} showOverview={showOverview} />
    );
  }

  if (mode === "student-preview") {
    return (
      <MultipleChoicePreview questions={questions} />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Multiple Choice Questions
        </h3>
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Add Question
        </button>
      </div>

      {questions.map((question, questionIndex) => (
        <div
          key={questionIndex}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Question Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Question {questionIndex + 1}
            </h4>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(questionIndex)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Remove question"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <textarea
              value={question.question}
              onChange={(e) =>
                updateQuestion(questionIndex, "question", e.target.value)
              }
              placeholder="Enter your question here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              rows={2}
            />
            <div className="my-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Image (Optional)
              </label>
              <ImageUpload
                value={question.questionImage}
                onChange={(url) =>
                  updateQuestion(questionIndex, "questionImage", url)
                }
                placeholder="Add image to question"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Answer Options
              </label>
              <button
                onClick={() => addOption(questionIndex)}
                className="text-brand-blue hover:text-brand-blue-dark text-sm transition-colors"
              >
                + Add Option
              </button>
            </div>

            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-3">
                {/* Correct Answer Radio */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-${questionIndex}`}
                    checked={question.correct === optionIndex}
                    onChange={() =>
                      updateQuestion(questionIndex, "correct", optionIndex)
                    }
                    className="w-4 h-4 text-brand-green focus:ring-brand-green"
                  />
                  <span className="ml-2 text-sm text-gray-600">Correct</span>
                </label>

                {/* Option Text */}
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    updateOption(questionIndex, optionIndex, e.target.value)
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />

                {/* Remove Option */}
                {question.options.length > 2 && (
                  <button
                    onClick={() => removeOption(questionIndex, optionIndex)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Remove option"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
            <div className="space-y-2">
              {question.questionImage && (
                <img
                  src={question.questionImage}
                  alt="Question preview"
                  className="w-full max-h-48 object-cover rounded-lg mb-3"
                />
              )}
              <p className="font-medium text-gray-900">
                {question.question || "Question will appear here..."}
              </p>
              <div className="space-y-1">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-2 rounded border text-sm ${
                      question.correct === optionIndex
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}.{" "}
                    {option || `Option ${optionIndex + 1}`}
                    {question.correct === optionIndex && (
                      <span className="ml-2 text-green-600 font-medium">
                        (Correct)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Player component for students
function MultipleChoicePlayer({ questions, onComplete, showOverview = false }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Calculate and save score before showing results
      const score = calculateScore();
      setFinalScore(score);
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);

    if (onComplete) {
      onComplete(score);
    }

    return score;
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setFinalScore(0);
  };

  if (showResults) {
    // Use the finalScore that was calculated when finishing the quiz
    const score = finalScore;
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
              score >= 70
                ? "bg-green-100"
                : score >= 50
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
          >
            <span
              className={`text-4xl font-bold ${
                score >= 70
                  ? "text-green-600"
                  : score >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {score}%
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            You scored{" "}
            {
              Object.values(selectedAnswers).filter(
                (answer, index) => answer === questions[index]?.correct
              ).length
            }{" "}
            out of {questions.length} questions correctly.
          </p>

          <button
            onClick={restartQuiz}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Try Again
          </button>
        </div>

        {/* Show results with user answers and correct answers */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Results:</h3>
          <div className="space-y-6">
            {questions.map((question, questionIndex) => {
              const userAnswer = selectedAnswers[questionIndex];
              const isCorrect = userAnswer === question.correct;
              
              return (
                <div key={questionIndex} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-start mb-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Question {questionIndex + 1}: {question.question}
                      </h4>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Your answer: </span>
                          <span 
                            className={`text-sm font-medium ${
                              isCorrect ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {userAnswer !== undefined 
                              ? `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}`
                              : "No answer selected"
                            }
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Correct answer: </span>
                          <span className="text-sm font-medium text-green-600">
                            {String.fromCharCode(65 + question.correct)}. {question.options[question.correct]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        {question.questionImage && (
          <div className="mb-6">
            <img
              src={question.questionImage}
              alt="Question"
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {question.question}
        </h2>

        <div className="space-y-3 mb-8">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              onClick={() => handleAnswerSelect(optionIndex)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === optionIndex
                  ? "border-brand-blue bg-brand-blue/5"
                  : "border-gray-200 hover:border-pastel-blue hover:bg-gray-50"
              }`}
            >
              <span className="font-medium text-gray-700 mr-3">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>

      {/* Question Overview - Only show when in teacher preview mode */}
      {showOverview && questions.length > 1 && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Questions Overview
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  index === currentQuestion
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-gray-200 hover:border-pastel-blue hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-sm text-gray-900">
                  Question {index + 1}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {q.question || "No question text"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Preview component for teachers to see how students will see the exercise
function MultipleChoicePreview({ questions }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const question = questions[currentQuestion];

  if (!question || questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No questions to preview</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-pastel-blue/10 rounded-xl p-6 border border-pastel-blue/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue-dark">
              📝 Student Preview Mode
            </h2>
            <p className="text-gray-600 mt-1">
              This is how students will see this exercise
            </p>
          </div>
          <div className="text-brand-blue">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        {question.questionImage && (
          <div className="mb-6">
            <img
              src={question.questionImage}
              alt="Question"
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {question.question || "Question text will appear here"}
        </h2>

        <div className="space-y-3 mb-8">
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 bg-white cursor-default"
            >
              <span className="font-medium text-gray-700 mr-3">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              <span className="text-gray-900">
                {option || `Option ${optionIndex + 1}`}
              </span>
              {question.correct === optionIndex && (
                <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Correct Answer
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Question Overview */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Questions Overview
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`p-3 text-left rounded-lg border transition-all ${
                index === currentQuestion
                  ? "border-brand-blue bg-brand-blue/5"
                  : "border-gray-200 hover:border-pastel-blue hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">
                Question {index + 1}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {q.question || "No question text"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
