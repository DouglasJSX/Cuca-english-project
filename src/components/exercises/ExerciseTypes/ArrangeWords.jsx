import { useEffect, useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function ArrangeWords({
  content,
  onChange,
  mode = "editor",
  onComplete,
  showOverview = false,
}) {
  const [sentences, setSentences] = useState(
    content?.sentences || [
      {
        correct: "",
        sentenceImage: null,
        words: [],
        shuffled: [],
      },
    ]
  );

  const updateContent = (newSentences) => {
    setSentences(newSentences);
    if (onChange) {
      onChange({ sentences: newSentences });
    }
  };

  const addSentence = () => {
    const newSentences = [
      ...sentences,
      {
        correct: "",
        sentenceImage: null,
        words: [],
        shuffled: [],
      },
    ];
    updateContent(newSentences);
  };

  const removeSentence = (index) => {
    if (sentences.length <= 1) return;
    const newSentences = sentences.filter((_, i) => i !== index);
    updateContent(newSentences);
  };

  const updateSentence = (sentenceIndex, field, value) => {
    const newSentences = sentences.map((s, i) => {
      if (i === sentenceIndex) {
        return { ...s, [field]: value };
      }
      return s;
    });
    updateContent(newSentences);
  };

  const generateWords = (sentenceIndex) => {
    const sentence = sentences[sentenceIndex];
    if (!sentence.correct.trim()) return;

    // Split sentence into words, preserving punctuation
    const words = sentence.correct
      .trim()
      .split(/(\s+)/)
      .filter((word) => word.trim().length > 0)
      .map((word) => word.trim());

    // Create shuffled version
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    updateSentence(sentenceIndex, "words", words);
    updateSentence(sentenceIndex, "shuffled", shuffled);
  };

  const shuffleWords = (sentenceIndex) => {
    const sentence = sentences[sentenceIndex];
    if (!sentence.words.length) return;

    const shuffled = [...sentence.words].sort(() => Math.random() - 0.5);
    updateSentence(sentenceIndex, "shuffled", shuffled);
  };

  if (mode === "player") {
    return <ArrangeWordsPlayer sentences={sentences} onComplete={onComplete} showOverview={showOverview} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Arrange Words</h3>
        <button
          onClick={addSentence}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Add Sentence
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to create arrange words exercises:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Write the correct sentence in order</p>
          <p>• Click "Generate Words" to split into individual words</p>
          <p>
            • Students will see the words shuffled and arrange them in correct
            order
          </p>
          <p>
            • Example: "The cat is sleeping" becomes draggable words: [The]
            [cat] [is] [sleeping]
          </p>
        </div>
      </div>

      {sentences.map((sentence, sentenceIndex) => (
        <div
          key={sentenceIndex}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Sentence Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Sentence {sentenceIndex + 1}
            </h4>
            {sentences.length > 1 && (
              <button
                onClick={() => removeSentence(sentenceIndex)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Remove sentence"
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

          {/* Correct Sentence Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct sentence
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={sentence.correct}
                onChange={(e) =>
                  updateSentence(sentenceIndex, "correct", e.target.value)
                }
                placeholder="Enter the sentence in correct order..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
              <button
                onClick={() => generateWords(sentenceIndex)}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors whitespace-nowrap"
              >
                Generate Words
              </button>
            </div>
            {/* Sentence Image */}
            <div className="my-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sentence Image (Optional)
              </label>
              <ImageUpload
                value={sentence.sentenceImage}
                onChange={(url) =>
                  updateSentence(sentenceIndex, "sentenceImage", url)
                }
                placeholder="Add image to sentence"
              />
            </div>
          </div>

          {/* Generated Words */}
          {sentence.words && sentence.words.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Words ({sentence.words.length})
                </label>
                <button
                  onClick={() => shuffleWords(sentenceIndex)}
                  className="text-brand-blue hover:text-brand-blue-dark text-sm transition-colors"
                >
                  🔀 Shuffle Preview
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Correct Order */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Correct Order
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    {sentence.words.map((word, wordIndex) => (
                      <span
                        key={`correct-${wordIndex}`}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shuffled Preview */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Shuffled (Student View)
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {(sentence.shuffled || sentence.words).map(
                      (word, wordIndex) => (
                        <span
                          key={`shuffled-${wordIndex}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium cursor-move"
                        >
                          {word}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-gray-900">
            {sentence.sentenceImage && (
              <img
                src={sentence.sentenceImage}
                alt="Sentence preview"
                className="w-full max-h-48 object-cover rounded-lg mb-4"
              />
            )}
            {sentence.correct ? (
              <div className="space-y-2">
                <p>
                  <strong>Task:</strong> Arrange the words to form the correct
                  sentence
                </p>
                <p>
                  <strong>Correct answer:</strong> "{sentence.correct}"
                </p>
                {sentence.words.length > 0 && (
                  <p>
                    <strong>Words to arrange:</strong> {sentence.words.length}{" "}
                    words
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Enter a sentence to see the preview...
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Player component for students
function ArrangeWordsPlayer({ sentences, onComplete, showOverview = false }) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userArrangements, setUserArrangements] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [draggedWord, setDraggedWord] = useState(null);

  // Initialize arrangements
  useEffect(() => {
    const initialArrangements = {};
    sentences.forEach((sentence, index) => {
      initialArrangements[index] = {
        available: [...(sentence.shuffled || sentence.words || [])],
        arranged: [],
      };
    });
    setUserArrangements(initialArrangements);
  }, [sentences]);

  const moveWordToArranged = (wordIndex) => {
    setUserArrangements((prev) => {
      const current = prev[currentSentence] || { available: [], arranged: [] };
      const word = current.available[wordIndex];

      return {
        ...prev,
        [currentSentence]: {
          available: current.available.filter((_, i) => i !== wordIndex),
          arranged: [...current.arranged, word],
        },
      };
    });
  };

  const moveWordToAvailable = (wordIndex) => {
    setUserArrangements((prev) => {
      const current = prev[currentSentence] || { available: [], arranged: [] };
      const word = current.arranged[wordIndex];

      return {
        ...prev,
        [currentSentence]: {
          available: [...current.available, word],
          arranged: current.arranged.filter((_, i) => i !== wordIndex),
        },
      };
    });
  };

  const moveArrangedWord = (fromIndex, toIndex) => {
    setUserArrangements((prev) => {
      const current = prev[currentSentence] || { available: [], arranged: [] };
      const newArranged = [...current.arranged];
      const [movedWord] = newArranged.splice(fromIndex, 1);
      newArranged.splice(toIndex, 0, movedWord);

      return {
        ...prev,
        [currentSentence]: {
          ...current,
          arranged: newArranged,
        },
      };
    });
  };

  const nextSentence = () => {
    if (currentSentence < sentences.length - 1) {
      setCurrentSentence((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousSentence = () => {
    if (currentSentence > 0) {
      setCurrentSentence((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;

    sentences.forEach((sentence, index) => {
      const userSentence = userArrangements[index]?.arranged.join(" ") || "";
      const correctSentence = sentence.correct || "";

      if (
        userSentence.toLowerCase().trim() ===
        correctSentence.toLowerCase().trim()
      ) {
        correct++;
      }
    });

    const score =
      sentences.length > 0 ? Math.round((correct / sentences.length) * 100) : 0;

    if (onComplete) {
      onComplete(score);
    }

    return score;
  };

  const restartExercise = () => {
    setCurrentSentence(0);
    setShowResults(false);

    // Reset arrangements
    const initialArrangements = {};
    sentences.forEach((sentence, index) => {
      initialArrangements[index] = {
        available: [...(sentence.shuffled || sentence.words || [])],
        arranged: [],
      };
    });
    setUserArrangements(initialArrangements);
  };

  if (showResults) {
    const score = calculateScore();
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
            Exercise Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            You arranged {Math.round((score / 100) * sentences.length)} out of{" "}
            {sentences.length} sentences correctly.
          </p>

          <button
            onClick={restartExercise}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Try Again
          </button>
        </div>

        {/* Show results with user answers and correct answers */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Results:</h3>
          <div className="space-y-4">
            {sentences.map((sentence, sentenceIndex) => {
              const userSentence =
                userArrangements[sentenceIndex]?.arranged.join(" ") || "";
              const isCorrect =
                userSentence.toLowerCase().trim() ===
                sentence.correct.toLowerCase().trim();

              return (
                <div
                  key={sentenceIndex}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center mb-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <span className="font-medium text-gray-900">
                      Sentence {sentenceIndex + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Your answer: </span>
                      <span 
                        className={`text-sm font-medium ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        "{userSentence}"
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Correct answer: </span>
                      <span className="text-sm font-medium text-green-600">
                        "{sentence.correct}"
                      </span>
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

  const sentence = sentences[currentSentence];
  const currentArrangement = userArrangements[currentSentence] || {
    available: [],
    arranged: [],
  };

  if (!sentence) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Sentence {currentSentence + 1} of {sentences.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentSentence + 1) / sentences.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentSentence + 1) / sentences.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Exercise */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        {sentence.sentenceImage && (
          <div className="mb-6">
            <img
              src={sentence.sentenceImage}
              alt="Sentence context"
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
          </div>
        )}
        <h2 className="text-lg font-medium text-gray-700 mb-6 text-center">
          Arrange the words to form a correct sentence:
        </h2>

        {/* User's Current Arrangement */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Your sentence:
          </p>
          <div className="min-h-16 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {currentArrangement.arranged.length === 0 ? (
              <p className="text-gray-400 text-center italic">
                Drag words here to build your sentence
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentArrangement.arranged.map((word, index) => (
                  <button
                    key={`arranged-${index}`}
                    onClick={() => moveWordToAvailable(index)}
                    className="px-3 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Words */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Available words:
          </p>
          <div className="min-h-16 p-4 border border-gray-300 rounded-lg">
            {currentArrangement.available.length === 0 ? (
              <p className="text-gray-400 text-center italic">All words used</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentArrangement.available.map((word, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => moveWordToArranged(index)}
                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Click on words to move them between the sentence area and
            available words
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousSentence}
            disabled={currentSentence === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={nextSentence}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            {currentSentence === sentences.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>

      {/* Sentences Overview - Only show when in teacher preview mode */}
      {showOverview && sentences.length > 1 && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Sentences Overview
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentences.map((sentence, index) => (
              <button
                key={index}
                onClick={() => setCurrentSentence(index)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  index === currentSentence
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-gray-200 hover:border-pastel-blue hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-sm text-gray-900">
                  Sentence {index + 1}
                </div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {sentence.correct || "No sentence text"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
