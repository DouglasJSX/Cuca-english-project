import { useState } from "react";

export default function FillBlank({
  content,
  onChange,
  mode = "editor",
  onComplete,
}) {
  const [sentences, setSentences] = useState(
    content?.sentences || [
      {
        text: "",
        blanks: [],
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
        text: "",
        blanks: [],
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

  const generateBlanks = (sentenceIndex) => {
    const sentence = sentences[sentenceIndex];
    if (!sentence.text) return;

    // Find words marked with [word] syntax
    const blankRegex = /\[([^\]]+)\]/g;
    const blanks = [];
    let match;

    while ((match = blankRegex.exec(sentence.text)) !== null) {
      blanks.push({
        word: match[1],
        position: match.index,
        length: match[0].length,
      });
    }

    updateSentence(sentenceIndex, "blanks", blanks);
  };

  const formatTextForDisplay = (text, blanks) => {
    if (!text || !blanks.length) return text;

    let formattedText = text;
    // Replace [word] with _____ for display
    formattedText = formattedText.replace(/\[([^\]]+)\]/g, "_____");

    return formattedText;
  };

  const formatTextForPlayer = (text, blanks) => {
    if (!text || !blanks.length) return { parts: [text], blankPositions: [] };

    const parts = [];
    const blankPositions = [];
    let lastIndex = 0;

    // Sort blanks by position
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank, index) => {
      // Add text before the blank
      if (blank.position > lastIndex) {
        parts.push(text.substring(lastIndex, blank.position));
      }

      // Add blank placeholder
      parts.push(`__BLANK_${index}__`);
      blankPositions.push(index);

      lastIndex = blank.position + blank.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return { parts, blankPositions };
  };

  if (mode === "player") {
    return <FillBlankPlayer sentences={sentences} onComplete={onComplete} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Fill in the Blanks
        </h3>
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
          How to create blanks:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • Use square brackets around words you want to become blanks:{" "}
            <code className="bg-blue-100 px-1 rounded">[word]</code>
          </p>
          <p>
            • Example: "The [cat] is [sleeping] on the sofa" → "The _____ is
            _____ on the sofa"
          </p>
          <p>• Click "Generate Blanks" after writing your sentence</p>
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

          {/* Sentence Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentence with blanks
            </label>
            <div className="flex space-x-3">
              <textarea
                value={sentence.text}
                onChange={(e) =>
                  updateSentence(sentenceIndex, "text", e.target.value)
                }
                placeholder="Enter your sentence here. Use [word] for blanks. Example: The [cat] is [sleeping]."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={2}
              />
              <button
                onClick={() => generateBlanks(sentenceIndex)}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors whitespace-nowrap"
              >
                Generate Blanks
              </button>
            </div>
          </div>

          {/* Blanks List */}
          {sentence.blanks && sentence.blanks.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detected blanks ({sentence.blanks.length})
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sentence.blanks.map((blank, blankIndex) => (
                  <div
                    key={blankIndex}
                    className="bg-gray-50 px-3 py-2 rounded border"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {blank.word}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="text-gray-900">
              {sentence.text ? (
                <p className="text-lg">
                  {formatTextForDisplay(sentence.text, sentence.blanks || [])}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  Sentence will appear here...
                </p>
              )}
            </div>
            {sentence.blanks && sentence.blanks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Students will need to fill in{" "}
                  <strong>{sentence.blanks.length}</strong> blank(s)
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Player component for students
function FillBlankPlayer({ sentences, onComplete }) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (sentenceIndex, blankIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`${sentenceIndex}-${blankIndex}`]: value.trim(),
    }));
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
    let total = 0;

    sentences.forEach((sentence, sentenceIndex) => {
      sentence.blanks?.forEach((blank, blankIndex) => {
        total++;
        const userAnswer =
          answers[`${sentenceIndex}-${blankIndex}`]?.toLowerCase();
        const correctAnswer = blank.word.toLowerCase();

        if (userAnswer === correctAnswer) {
          correct++;
        }
      });
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    if (onComplete) {
      onComplete(score);
    }

    return score;
  };

  const restartExercise = () => {
    setCurrentSentence(0);
    setAnswers({});
    setShowResults(false);
  };

  const renderSentenceWithBlanks = (sentence, sentenceIndex) => {
    if (!sentence.text || !sentence.blanks?.length) {
      return <span>{sentence.text}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    // Sort blanks by position
    const sortedBlanks = [...sentence.blanks].sort(
      (a, b) => a.position - b.position
    );

    sortedBlanks.forEach((blank, blankIndex) => {
      // Add text before the blank
      if (blank.position > lastIndex) {
        parts.push(sentence.text.substring(lastIndex, blank.position));
      }

      // Add input for the blank
      parts.push(
        <input
          key={`${sentenceIndex}-${blankIndex}`}
          type="text"
          value={answers[`${sentenceIndex}-${blankIndex}`] || ""}
          onChange={(e) =>
            handleAnswerChange(sentenceIndex, blankIndex, e.target.value)
          }
          className="inline-block mx-1 px-2 py-1 border-b-2 border-brand-blue focus:border-brand-blue-dark outline-none bg-transparent text-center"
          style={{ width: `${Math.max(blank.word.length * 0.8, 3)}ch` }}
          placeholder="____"
          disabled={showResults}
        />
      );

      lastIndex = blank.position + blank.length;
    });

    // Add remaining text
    if (lastIndex < sentence.text.length) {
      parts.push(sentence.text.substring(lastIndex));
    }

    return <span>{parts}</span>;
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
            You filled in the blanks with {score}% accuracy.
          </p>

          <button
            onClick={restartExercise}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Try Again
          </button>
        </div>

        {/* Show correct answers */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Correct Answers:
          </h3>
          <div className="space-y-4">
            {sentences.map((sentence, sentenceIndex) => (
              <div key={sentenceIndex} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">
                  {sentence.text.replace(/\[([^\]]+)\]/g, "$1")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sentence = sentences[currentSentence];
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

      {/* Sentence */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <h2 className="text-lg font-medium text-gray-700 mb-6 text-center">
          Fill in the blanks:
        </h2>

        <div className="text-xl leading-relaxed text-center mb-8 text-gray-900">
          {renderSentenceWithBlanks(sentence, currentSentence)}
        </div>

        {sentence.blanks && sentence.blanks.length > 0 && (
          <p className="text-sm text-gray-500 text-center mb-8">
            Fill in {sentence.blanks.length} blank(s) above
          </p>
        )}

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
    </div>
  );
}
