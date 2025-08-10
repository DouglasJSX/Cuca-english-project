import { useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import { FlashCardsPreview } from "../PreviewComponents";

export default function FlashCards({
  content,
  onChange,
  mode = "editor",
  onComplete,
}) {
  const [cards, setCards] = useState(
    content?.cards || [
      {
        front: "",
        back: "",
        frontImage: null,
        backImage: null,
      },
    ]
  );
  const updateContent = (newCards) => {
    setCards(newCards);
    if (onChange) {
      onChange({ cards: newCards });
    }
  };

  const addCard = () => {
    const newCards = [
      ...cards,
      { front: "", back: "", frontImage: null, backImage: null },
    ];
    updateContent(newCards);
  };

  const removeCard = (index) => {
    if (cards.length <= 1) return;
    const newCards = cards.filter((_, i) => i !== index);
    updateContent(newCards);
  };

  const updateCard = (cardIndex, field, value) => {
    const newCards = cards.map((card, i) => {
      if (i === cardIndex) {
        return { ...card, [field]: value };
      }
      return card;
    });
    updateContent(newCards);
  };

  if (mode === "player") {
    return <FlashCardsPlayer cards={cards} onComplete={onComplete} />;
  }

  if (mode === "preview") {
    return <FlashCardsPlayer cards={cards} onComplete={() => {}} />;
  }

  if (mode === "student-preview") {
    return <FlashCardsPreview cards={cards} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Flash Cards</h3>
        <button
          onClick={addCard}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
        >
          Add Card
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to create flash cards:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • <strong>Front:</strong> The word, phrase, or question students
            will see first
          </p>
          <p>
            • <strong>Back:</strong> The translation, definition, or answer
          </p>
          <p>
            • Students can flip cards to reveal the answer and mark if they got
            it right
          </p>
          <p>• Example: Front: "Hello" → Back: "Olá" (Portuguese)</p>
        </div>
      </div>

      {cards.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Card {cardIndex + 1}
            </h4>
            {cards.length > 1 && (
              <button
                onClick={() => removeCard(cardIndex)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Remove card"
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

          <div className="space-y-6">
            {/* Front Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front (Question/Word)
              </label>
              <textarea
                value={card.front}
                onChange={(e) => updateCard(cardIndex, "front", e.target.value)}
                placeholder="e.g., Hello, What is the capital of Brazil?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />

              {/* Front Image */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front Image (Optional)
                </label>
                <ImageUpload
                  value={card.frontImage}
                  onChange={(url) => updateCard(cardIndex, "frontImage", url)}
                  placeholder="Add image to front of card"
                />
              </div>
            </div>

            {/* Back Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Back (Answer/Translation)
              </label>
              <textarea
                value={card.back}
                onChange={(e) => updateCard(cardIndex, "back", e.target.value)}
                placeholder="e.g., Olá, Brasília"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                rows={3}
              />

              {/* Back Image */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back Image (Optional)
                </label>
                <ImageUpload
                  value={card.backImage}
                  onChange={(url) => updateCard(cardIndex, "backImage", url)}
                  placeholder="Add image to back of card"
                />
              </div>
            </div>
          </div>

          {/* Card Preview */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
              <p className="text-xs font-medium text-brand-blue-dark mb-2 uppercase tracking-wide">
                Front Preview
              </p>
              {card.frontImage && (
                <img
                  src={card.frontImage}
                  alt="Front preview"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <div className="text-gray-900 font-medium">
                {card.front || "Front content will appear here..."}
              </div>
            </div>

            <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
              <p className="text-xs font-medium text-brand-green-dark mb-2 uppercase tracking-wide">
                Back Preview
              </p>
              {card.backImage && (
                <img
                  src={card.backImage}
                  alt="Back preview"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <div className="text-gray-900 font-medium">
                {card.back || "Back content will appear here..."}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Player component for students
function FlashCardsPlayer({ cards, onComplete }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [studyMode, setStudyMode] = useState("study"); // 'study' or 'test'
  const [shuffledCards, setShuffledCards] = useState(cards);

  const nextCard = () => {
    if (currentCard < shuffledCards.length - 1) {
      setCurrentCard((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const markCard = (correct) => {
    setResults((prev) => ({
      ...prev,
      [currentCard]: correct,
    }));

    // Auto advance after marking
    setTimeout(() => {
      nextCard();
    }, 500);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const restartCards = () => {
    setShuffledCards(cards); // Volta à ordem original
    setCurrentCard(0);
    setIsFlipped(false);
    setResults({});
    setShowResults(false);
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
    setResults({});
    setShowResults(false);
  };

  const calculateScore = () => {
    const correctCount = Object.values(results).filter(Boolean).length;
    const score =
      cards.length > 0 ? Math.round((correctCount / cards.length) * 100) : 0;

    if (onComplete) {
      onComplete(score);
    }

    return score;
  };

  if (showResults) {
    const score = calculateScore();
    const correctCount = Object.values(results).filter(Boolean).length;

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
            Study Session Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            You got {correctCount} out of {cards.length} cards correct.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={restartCards}
              className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
            >
              Study Again
            </button>
            <button
              onClick={shuffleCards}
              className="px-6 py-3 border border-brand-blue text-brand-blue rounded-lg hover:bg-brand-blue/10 transition-colors"
            >
              Shuffle & Restart
            </button>
          </div>
        </div>

        {/* Show results with user performance for each card */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Results:</h3>
          <div className="space-y-4">
            {cards.map((card, cardIndex) => {
              const userResult = results[cardIndex];
              const isCorrect = userResult === true;
              const wasAnswered = userResult !== undefined;
              
              return (
                <div
                  key={cardIndex}
                  className={`p-4 rounded-lg border ${
                    !wasAnswered 
                      ? "border-gray-200 bg-gray-50"
                      : isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start mb-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        !wasAnswered
                          ? "bg-gray-400 text-white"
                          : isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {!wasAnswered ? "?" : isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Card {cardIndex + 1}
                      </h4>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Question: </span>
                          <span className="text-sm text-gray-900">"{card.front}"</span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Answer: </span>
                          <span className="text-sm text-gray-900">"{card.back}"</span>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-700">Your response: </span>
                          <span 
                            className={`text-sm font-medium ${
                              !wasAnswered 
                                ? "text-gray-500"
                                : isCorrect 
                                ? "text-green-600" 
                                : "text-red-600"
                            }`}
                          >
                            {!wasAnswered 
                              ? "Not answered"
                              : isCorrect 
                              ? "I knew it!" 
                              : "I didn't know"
                            }
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

  const card = shuffledCards[currentCard];
  if (!card) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Card {currentCard + 1} of {shuffledCards.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentCard + 1) / shuffledCards.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentCard + 1) / shuffledCards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Flash Card */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div
          className={`
            cursor-pointer transition-all duration-500 ease-in-out transform-style-preserve-3d
            ${isFlipped ? "rotate-y-180" : "rotate-y-0"}
          `}
          onClick={flipCard}
        >
          <div className="p-8 min-h-80 flex flex-col justify-center items-center text-center">
            {!isFlipped ? (
              // Front of card
              <div className="space-y-4 max-w-md w-full">
                <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-brand-blue font-bold text-lg">?</span>
                </div>

                {/* Front Image */}
                {card.frontImage && (
                  <div className="relative bg-white overflow-hidden">
                    <img
                      src={card.frontImage}
                      alt="Question image"
                      className="w-fit mx-auto h-full object-contain max-h-[300px] rounded-lg"
                    />
                  </div>
                )}

                <div className="text-2xl font-medium text-gray-900 leading-relaxed">
                  {card.front}
                </div>
                <p className="text-gray-500 text-sm">Click to reveal answer</p>
              </div>
            ) : (
              // Back of card
              <div className="space-y-4 max-w-md w-full">
                <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-brand-green font-bold text-lg">✓</span>
                </div>

                {/* Back Image */}
                {card.backImage && (
                  <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="aspect-w-16 aspect-h-9 max-h-64">
                      <img
                        src={card.backImage}
                        alt="Answer image"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="text-2xl font-medium text-gray-900 leading-relaxed">
                  {card.back}
                </div>
                <p className="text-gray-500 text-sm">Did you get it right?</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {isFlipped && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <p className="text-center text-gray-700 mb-4 font-medium">
            Did you know the answer?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => markCard(false)}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              ✗ No, I didn't know
            </button>
            <button
              onClick={() => markCard(true)}
              className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              ✓ Yes, I knew it!
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousCard}
          disabled={currentCard === 0}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {!isFlipped ? (
          <button
            onClick={flipCard}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Flip Card
          </button>
        ) : (
          <button
            onClick={nextCard}
            className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
          >
            {currentCard === shuffledCards.length - 1 ? "Finish" : "Next Card"}
          </button>
        )}
      </div>
    </div>
  );
}
