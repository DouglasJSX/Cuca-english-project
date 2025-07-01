import { useState } from "react";

export default function Translation({
  content,
  onChange,
  mode = "editor",
  onComplete,
}) {
  const [items, setItems] = useState(
    content?.items || [
      {
        source: "",
        target: "",
        language: "Portuguese",
      },
    ]
  );

  const languages = [
    "Portuguese",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Dutch",
    "Russian",
    "Chinese",
    "Japanese",
    "Korean",
  ];

  const updateContent = (newItems) => {
    setItems(newItems);
    if (onChange) {
      onChange({ items: newItems });
    }
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        source: "",
        target: "",
        language: items[0]?.language || "Portuguese",
      },
    ];
    updateContent(newItems);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    updateContent(newItems);
  };

  const updateItem = (itemIndex, field, value) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateContent(newItems);
  };

  if (mode === "player") {
    return <TranslationPlayer items={items} onComplete={onComplete} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Translation Exercise
        </h3>
        <button
          onClick={addItem}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Add Translation
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to create translation exercises:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • <strong>Source:</strong> The English word, phrase, or sentence to
            translate
          </p>
          <p>
            • <strong>Target:</strong> The correct translation in the target
            language
          </p>
          <p>
            • <strong>Language:</strong> Select the target language for
            translation
          </p>
          <p>• Students will type their translation and get instant feedback</p>
        </div>
      </div>

      {/* Global Language Setting */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Language (applies to all items)
        </label>
        <select
          value={items[0]?.language || "Portuguese"}
          onChange={(e) => {
            const newLanguage = e.target.value;
            const newItems = items.map((item) => ({
              ...item,
              language: newLanguage,
            }));
            updateContent(newItems);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {items.map((item, itemIndex) => (
        <div
          key={itemIndex}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Item Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Translation {itemIndex + 1}
            </h4>
            {items.length > 1 && (
              <button
                onClick={() => removeItem(itemIndex)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Remove translation"
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Source (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source (English)
              </label>
              <textarea
                value={item.source}
                onChange={(e) =>
                  updateItem(itemIndex, "source", e.target.value)
                }
                placeholder="e.g., Hello, How are you?, The cat is sleeping"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Target Translation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target ({item.language})
              </label>
              <textarea
                value={item.target}
                onChange={(e) =>
                  updateItem(itemIndex, "target", e.target.value)
                }
                placeholder={`e.g., ${
                  item.language === "Portuguese"
                    ? "Olá, Como você está?, O gato está dormindo"
                    : item.language === "Spanish"
                    ? "Hola, ¿Cómo estás?, El gato está durmiendo"
                    : item.language === "French"
                    ? "Bonjour, Comment allez-vous?, Le chat dort"
                    : "Translation in " + item.language
                }`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          {/* Translation Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Translation Preview:
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex-1 p-3 bg-white border border-gray-300 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">English</p>
                <p className="font-medium text-gray-900">
                  {item.source || "Source text will appear here..."}
                </p>
              </div>

              <div className="px-2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>

              <div className="flex-1 p-3 bg-white border border-gray-300 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{item.language}</p>
                <p className="font-medium text-gray-900">
                  {item.target || "Translation will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Student View Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Student View Preview:
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Students will see the English text and type their translation in{" "}
          {items[0]?.language || "the target language"}.
        </p>
        <div className="space-y-4">
          {items
            .filter((item) => item.source.trim())
            .slice(0, 2)
            .map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-4"
              >
                <p className="font-medium text-gray-900 mb-2">{item.source}</p>
                <input
                  type="text"
                  placeholder={`Type your ${item.language} translation here...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled
                />
              </div>
            ))}
          {items.filter((item) => item.source.trim()).length > 2 && (
            <p className="text-sm text-gray-500 text-center">
              ... and {items.filter((item) => item.source.trim()).length - 2}{" "}
              more translation(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Player component for students
function TranslationPlayer({ items, onComplete }) {
  const [currentItem, setCurrentItem] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState({});

  const validItems = items.filter(
    (item) => item.source.trim() && item.target.trim()
  );

  const handleAnswerChange = (itemIndex, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [itemIndex]: value,
    }));
  };

  const nextItem = () => {
    if (currentItem < validItems.length - 1) {
      setCurrentItem((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousItem = () => {
    if (currentItem > 0) {
      setCurrentItem((prev) => prev - 1);
    }
  };

  const toggleHint = (itemIndex) => {
    setShowHint((prev) => ({
      ...prev,
      [itemIndex]: !prev[itemIndex],
    }));
  };

  const checkAnswer = (userAnswer, correctAnswer) => {
    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:]/g, "")
        .replace(/\s+/g, " ");
    };

    const userNormalized = normalizeText(userAnswer || "");
    const correctNormalized = normalizeText(correctAnswer);

    // Exact match
    if (userNormalized === correctNormalized) return "exact";

    // Partial match (contains most words)
    const userWords = userNormalized.split(" ").filter((w) => w.length > 0);
    const correctWords = correctNormalized
      .split(" ")
      .filter((w) => w.length > 0);

    if (userWords.length === 0) return "empty";

    const matchingWords = userWords.filter((word) =>
      correctWords.some(
        (correctWord) =>
          correctWord.includes(word) || word.includes(correctWord)
      )
    );

    const matchPercentage = matchingWords.length / correctWords.length;

    if (matchPercentage >= 0.7) return "good";
    if (matchPercentage >= 0.4) return "partial";
    return "incorrect";
  };

  const calculateScore = () => {
    let exactMatches = 0;
    let goodMatches = 0;
    let totalItems = validItems.length;

    validItems.forEach((item, index) => {
      const result = checkAnswer(userAnswers[index], item.target);
      if (result === "exact") exactMatches++;
      else if (result === "good") goodMatches++;
    });

    const exactScore =
      totalItems > 0 ? Math.round((exactMatches / totalItems) * 100) : 0;
    const goodScore =
      totalItems > 0
        ? Math.round(((exactMatches + goodMatches) / totalItems) * 100)
        : 0;

    if (onComplete) {
      onComplete(goodScore);
    }

    return { exactScore, goodScore, exactMatches, goodMatches, totalItems };
  };

  const restartExercise = () => {
    setCurrentItem(0);
    setUserAnswers({});
    setShowResults(false);
    setShowHint({});
  };

  if (validItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-600">No translation items available.</p>
      </div>
    );
  }

  if (showResults) {
    const { exactScore, goodScore, exactMatches, goodMatches, totalItems } =
      calculateScore();

    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
              exactScore >= 70
                ? "bg-green-100"
                : exactScore >= 50
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
          >
            <span
              className={`text-4xl font-bold ${
                exactScore >= 70
                  ? "text-green-600"
                  : exactScore >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {exactScore}%
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Translation Complete!
          </h2>
          <div className="text-gray-600 mb-6 space-y-1">
            <p>
              <strong>Exact matches:</strong> {exactMatches}/{totalItems} (
              {exactScore}%)
            </p>
            <p>
              <strong>Good matches:</strong> {goodMatches}/{totalItems}{" "}
              (including partial)
            </p>
            <p>
              <strong>Overall accuracy:</strong> {goodScore}%
            </p>
          </div>

          <button
            onClick={restartExercise}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Try Again
          </button>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Results:
          </h3>
          <div className="space-y-4">
            {validItems.map((item, index) => {
              const userAnswer = userAnswers[index] || "";
              const result = checkAnswer(userAnswer, item.target);

              const resultConfig = {
                exact: {
                  bg: "bg-green-50",
                  border: "border-green-200",
                  text: "text-green-800",
                  icon: "✓",
                  label: "Perfect!",
                },
                good: {
                  bg: "bg-blue-50",
                  border: "border-blue-200",
                  text: "text-blue-800",
                  icon: "~",
                  label: "Good!",
                },
                partial: {
                  bg: "bg-yellow-50",
                  border: "border-yellow-200",
                  text: "text-yellow-800",
                  icon: "±",
                  label: "Partial",
                },
                incorrect: {
                  bg: "bg-red-50",
                  border: "border-red-200",
                  text: "text-red-800",
                  icon: "✗",
                  label: "Incorrect",
                },
                empty: {
                  bg: "bg-gray-50",
                  border: "border-gray-200",
                  text: "text-gray-800",
                  icon: "○",
                  label: "No answer",
                },
              };

              const config = resultConfig[result];

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium">Translation {index + 1}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${config.text} bg-white`}
                    >
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>English:</strong> {item.source}
                    </p>
                    <p>
                      <strong>Your answer:</strong>{" "}
                      {userAnswer || "(no answer)"}
                    </p>
                    <p>
                      <strong>Correct answer:</strong> {item.target}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentItemData = validItems[currentItem];
  if (!currentItemData) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Translation {currentItem + 1} of {validItems.length}
          </span>
          <span className="text-sm text-gray-500">
            Target: {currentItemData.language}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentItem + 1) / validItems.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Translation Exercise */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <h2 className="text-lg font-medium text-gray-700 mb-6 text-center">
          Translate the following to {currentItemData.language}:
        </h2>

        {/* Source Text */}
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-xl font-medium text-gray-900 leading-relaxed">
            {currentItemData.source}
          </p>
        </div>

        {/* Translation Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your translation in {currentItemData.language}:
          </label>
          <textarea
            value={userAnswers[currentItem] || ""}
            onChange={(e) => handleAnswerChange(currentItem, e.target.value)}
            placeholder={`Type your ${currentItemData.language} translation here...`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-lg"
            rows={3}
          />
        </div>

        {/* Hint Button */}
        <div className="mb-6 text-center">
          <button
            onClick={() => toggleHint(currentItem)}
            className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            {showHint[currentItem] ? "Hide Hint" : "Show Hint"}
          </button>

          {showHint[currentItem] && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Hint:</strong>{" "}
                {currentItemData.target.substring(
                  0,
                  Math.ceil(currentItemData.target.length * 0.3)
                )}
                ...
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousItem}
            disabled={currentItem === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={nextItem}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            {currentItem === validItems.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
