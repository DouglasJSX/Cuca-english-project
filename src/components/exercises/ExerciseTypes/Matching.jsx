import { useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function Matching({
  content,
  onChange,
  mode = "editor",
  onComplete,
}) {
  const [pairs, setPairs] = useState(
    content?.pairs || [
      {
        left: "",
        leftImage: null,
        right: "",
        rightImage: null,
      },
    ]
  );

  const updateContent = (newPairs) => {
    setPairs(newPairs);
    if (onChange) {
      onChange({ pairs: newPairs });
    }
  };

  const addPair = () => {
    const newPairs = [
      ...pairs,
      {
        left: "",
        leftImage: null,
        right: "",
        rightImage: null,
      },
    ];
    updateContent(newPairs);
  };

  const removePair = (index) => {
    if (pairs.length <= 1) return;
    const newPairs = pairs.filter((_, i) => i !== index);
    updateContent(newPairs);
  };

  const updatePair = (pairIndex, field, value) => {
    const newPairs = pairs.map((pair, i) => {
      if (i === pairIndex) {
        return { ...pair, [field]: value };
      }
      return pair;
    });
    updateContent(newPairs);
  };

  if (mode === "player") {
    return <MatchingPlayer pairs={pairs} onComplete={onComplete} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Matching Exercise
        </h3>
        <button
          onClick={addPair}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Add Pair
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to create matching exercises:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • <strong>Left side:</strong> Words, terms, or questions
          </p>
          <p>
            • <strong>Right side:</strong> Definitions, translations, or answers
          </p>
          <p>• Students will connect items from left to right by clicking</p>
          <p>• Example: "Cat" → "Animal that meows"</p>
        </div>
      </div>

      {pairs.map((pair, pairIndex) => (
        <div
          key={pairIndex}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Pair Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Pair {pairIndex + 1}
            </h4>
            {pairs.length > 1 && (
              <button
                onClick={() => removePair(pairIndex)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Remove pair"
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
            {/* Left Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Left Side (Term/Question)
              </label>
              <textarea
                value={pair.left}
                onChange={(e) => updatePair(pairIndex, "left", e.target.value)}
                placeholder="e.g., Cat, Hello, Capital of Brazil"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />

              {/* Left Image */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Left Image (Optional)
                </label>
                <ImageUpload
                  value={pair.leftImage}
                  onChange={(url) => updatePair(pairIndex, "leftImage", url)}
                  placeholder="Add image to left side"
                />
              </div>
            </div>

            {/* Right Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Right Side (Definition/Answer)
              </label>
              <textarea
                value={pair.right}
                onChange={(e) => updatePair(pairIndex, "right", e.target.value)}
                placeholder="e.g., Animal that meows, Olá, Brasília"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />

              {/* Right Image */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Right Image (Optional)
                </label>
                <ImageUpload
                  value={pair.rightImage}
                  onChange={(url) => updatePair(pairIndex, "rightImage", url)}
                  placeholder="Add image to right side"
                />
              </div>
            </div>
          </div>

          {/* Connection Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Connection Preview:
            </p>
            <div className="flex items-center justify-between">
              <div className="flex-1 p-3 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-center">
                {pair.leftImage && (
                  <img
                    src={pair.leftImage}
                    alt="Left preview"
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                )}
                <span className="font-medium text-brand-blue-dark">
                  {pair.left || "Left side content"}
                </span>
              </div>

              <div className="px-4">
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

              <div className="flex-1 p-3 bg-brand-green/10 border border-brand-green/20 rounded-lg text-center">
                {pair.rightImage && (
                  <img
                    src={pair.rightImage}
                    alt="Right preview"
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                )}
                <span className="font-medium text-brand-green-dark">
                  {pair.right || "Right side content"}
                </span>
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
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">
              Terms to match:
            </p>
            <div className="space-y-2">
              {pairs
                .filter((p) => p.left.trim())
                .map((pair, index) => (
                  <div
                    key={`left-${index}`}
                    className="p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-brand-blue/5 transition-colors"
                  >
                    {pair.left}
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-3">
              Definitions/Answers:
            </p>
            <div className="space-y-2">
              {pairs
                .filter((p) => p.right.trim())
                .map((pair, index) => (
                  <div
                    key={`right-${index}`}
                    className="p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-brand-green/5 transition-colors"
                  >
                    {pair.right}
                  </div>
                ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Students will click items to connect them. Right side will be
          shuffled.
        </p>
      </div>
    </div>
  );
}

// Player component for students
function MatchingPlayer({ pairs, onComplete }) {
  const [leftItems] = useState(
    pairs.filter((p) => p.left.trim() && p.right.trim())
  );
  const [rightItems] = useState(() => {
    // Shuffle right items
    const items = pairs.filter((p) => p.left.trim() && p.right.trim());
    return [...items].sort(() => Math.random() - 0.5);
  });

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleLeftClick = (index) => {
    // Don't allow selecting already matched items
    if (matches[`left-${index}`]) return;

    setSelectedLeft(index);
    setSelectedRight(null);
  };

  const handleRightClick = (index) => {
    // Don't allow selecting already matched items
    if (Object.values(matches).includes(`right-${index}`)) return;

    if (selectedLeft !== null) {
      // Check if this is a correct match
      const leftItem = leftItems[selectedLeft];
      const rightItem = rightItems[index];

      setAttempts((prev) => prev + 1);

      const isCorrect = pairs.some(
        (pair) =>
          pair.left.trim() === leftItem.left.trim() &&
          pair.right.trim() === rightItem.right.trim()
      );

      if (isCorrect) {
        // Correct match
        setMatches((prev) => ({
          ...prev,
          [`left-${selectedLeft}`]: `right-${index}`,
        }));
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all matches are complete
        if (Object.keys(matches).length + 1 === leftItems.length) {
          setTimeout(() => {
            // Calculate and save score before showing results
            calculateScore();
            setShowResults(true);
          }, 500);
        }
      } else {
        // Incorrect match - show briefly then reset
        setSelectedRight(index);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 1000);
      }
    } else {
      setSelectedRight(index);
    }
  };

  const restartExercise = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatches({});
    setShowResults(false);
    setAttempts(0);

    // Re-shuffle right items
    const shuffled = [...rightItems].sort(() => Math.random() - 0.5);
    // Note: In a real implementation, you'd update the state properly
  };

  const calculateScore = () => {
    const correctMatches = Object.keys(matches).length;
    const totalPairs = leftItems.length;
    const score =
      totalPairs > 0 ? Math.round((correctMatches / totalPairs) * 100) : 0;

    if (onComplete) {
      onComplete(score);
    }

    return score;
  };

  if (showResults) {
    const score = calculateScore();
    const efficiency =
      leftItems.length > 0
        ? Math.round((leftItems.length / attempts) * 100)
        : 0;

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
            Matching Complete!
          </h2>
          <div className="text-gray-600 mb-6 space-y-2">
            <p>You matched all {leftItems.length} pairs correctly!</p>
            <p>
              Attempts: {attempts} | Efficiency: {efficiency}%
            </p>
          </div>

          <button
            onClick={restartExercise}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Try Again
          </button>
        </div>

        {/* Show results with matching performance */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Results:</h3>
          <div className="space-y-4">
            {pairs
              .filter((p) => p.left.trim() && p.right.trim())
              .map((pair, pairIndex) => {
                const isMatched = Object.keys(matches).some(leftKey => {
                  const leftIndex = parseInt(leftKey.split('-')[1]);
                  return leftItems[leftIndex]?.left === pair.left;
                });
                
                return (
                  <div
                    key={pairIndex}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-start mb-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                          isMatched
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {isMatched ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Pair {pairIndex + 1}
                        </h4>
                        
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">Term: </span>
                            <span className="text-sm font-medium text-gray-900">"{pair.left}"</span>
                          </div>
                          
                          <svg
                            className={`w-5 h-5 mx-3 ${
                              isMatched ? "text-green-600" : "text-gray-400"
                            }`}
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
                          
                          <div className="flex-1 text-right">
                            <span className="text-sm font-medium text-gray-700">Definition: </span>
                            <span className="text-sm font-medium text-gray-900">"{pair.right}"</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Result: </span>
                          <span 
                            className={`text-sm font-medium ${
                              isMatched ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isMatched ? "Correctly matched" : "Not matched"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Performance Summary:</strong> {Object.keys(matches).length} out of {leftItems.length} pairs matched correctly 
              in {attempts} attempts (Efficiency: {leftItems.length > 0 ? Math.round((leftItems.length / attempts) * 100) : 0}%)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Progress: {Object.keys(matches).length} of {leftItems.length}{" "}
            matched
          </span>
          <span className="text-sm text-gray-500">Attempts: {attempts}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (Object.keys(matches).length / leftItems.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800">
          Click on a term from the left column, then click on its matching
          definition from the right column.
        </p>
      </div>

      {/* Matching Game */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms</h3>
            <div className="space-y-3">
              {leftItems.map((item, index) => {
                const isMatched = matches[`left-${index}`];
                const isSelected = selectedLeft === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleLeftClick(index)}
                    disabled={isMatched}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isMatched
                        ? "bg-green-50 border-green-300 text-green-800 cursor-not-allowed"
                        : isSelected
                        ? "bg-brand-blue border-brand-blue text-white"
                        : "bg-white border-gray-300 hover:border-brand-blue hover:bg-brand-blue/5"
                    }`}
                  >
                    <div>
                      {item.leftImage && (
                        <img
                          src={item.leftImage}
                          alt="Left item"
                          className="w-full h-16 object-cover rounded mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.left}</span>
                        {isMatched && (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        {isSelected && !isMatched && (
                          <svg
                            className="w-5 h-5 text-white"
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
                        )}
                        {/* icons... */}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Definitions
            </h3>
            <div className="space-y-3">
              {rightItems.map((item, index) => {
                const isMatched = Object.values(matches).includes(
                  `right-${index}`
                );
                const isSelected = selectedRight === index;
                const isWrongSelection =
                  selectedRight === index && selectedLeft !== null;

                return (
                  <button
                    key={index}
                    onClick={() => handleRightClick(index)}
                    disabled={isMatched}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isMatched
                        ? "bg-green-50 border-green-300 text-green-800 cursor-not-allowed"
                        : isWrongSelection
                        ? "bg-red-50 border-red-300 text-red-800"
                        : isSelected
                        ? "bg-brand-green border-brand-green text-white"
                        : "bg-white border-gray-300 hover:border-brand-green hover:bg-brand-green/5"
                    }`}
                  >
                    <div>
                      {item.rightImage && (
                        <img
                          src={item.rightImage}
                          alt="Right item"
                          className="w-full h-16 object-cover rounded mb-2"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.right}</span>
                        {isMatched && (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        {isWrongSelection && (
                          <svg
                            className="w-5 h-5 text-red-600"
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
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedLeft !== null && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800">
              Selected: <strong>"{leftItems[selectedLeft]?.left}"</strong> - Now
              click on the matching definition
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
