import { useState } from "react";

// Generic Preview Header Component
export function PreviewHeader({ title, totalItems, currentItem }) {
  return (
    <div className="bg-pastel-blue/10 rounded-xl p-6 border border-pastel-blue/20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue-dark">
            👁️ Student Preview Mode
          </h2>
          <p className="text-gray-600 mt-1">
            This is how students will see this exercise
          </p>
        </div>
        {totalItems > 1 && (
          <div className="text-brand-blue">
            <span className="text-sm font-medium">
              {currentItem + 1} of {totalItems}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Generic Progress Bar Component
export function ProgressBar({ current, total }) {
  if (total <= 1) return null;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">
          {current + 1}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-blue h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((current + 1) / total) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}

// Generic Navigation Component
export function PreviewNavigation({ current, total, onPrevious, onNext }) {
  if (total <= 1) return null;

  return (
    <div className="flex justify-between">
      <button
        onClick={onPrevious}
        disabled={current === 0}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <button
        onClick={onNext}
        disabled={current === total - 1}
        className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

// Generic Overview Component
export function PreviewOverview({ items, currentIndex, onSelect, itemTitle = "Item" }) {
  if (!items || items.length <= 1) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        All {itemTitle}s Overview
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`p-3 text-left rounded-lg border transition-all ${
              index === currentIndex
                ? "border-brand-blue bg-brand-blue/5"
                : "border-gray-200 hover:border-pastel-blue hover:bg-gray-50"
            }`}
          >
            <div className="font-medium text-sm text-gray-900">
              {itemTitle} {index + 1}
            </div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {getItemPreview(item, itemTitle)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function to get preview text for different item types
function getItemPreview(item, itemType) {
  if (!item) return "No content";
  
  switch (itemType.toLowerCase()) {
    case "question":
      return item.question || "No question text";
    case "sentence":
      return item.text || "No sentence text";
    case "card":
      return item.front || "No card text";
    case "pair":
      return `${item.left || "No left text"} - ${item.right || "No right text"}`;
    default:
      return item.text || item.question || item.front || "No content";
  }
}

// Generic Simple Preview Component for other exercise types
export function SimpleExercisePreview({ title, children }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PreviewHeader title={title} />
      
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        {children}
      </div>
    </div>
  );
}

// Fill in the Blanks Preview Component
export function FillBlankPreview({ sentences }) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const sentence = sentences[currentSentence];

  if (!sentence || sentences.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No sentences to preview</p>
      </div>
    );
  }

  const renderSentenceWithBlanks = (text, blanks) => {
    if (!text || !blanks || blanks.length === 0) {
      return <span>{text || "Sentence text will appear here"}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    blanks.forEach((blank, index) => {
      // Add text before the blank
      if (blank.start > lastIndex) {
        parts.push(text.substring(lastIndex, blank.start));
      }
      
      // Add the blank with correct answer shown
      parts.push(
        <span
          key={index}
          className="inline-block mx-1 px-3 py-1 bg-yellow-100 border-2 border-yellow-300 rounded text-yellow-800 font-medium"
        >
          {blank.answer || "___"}
          <span className="ml-2 text-xs bg-green-100 text-green-700 px-1 rounded">
            Answer
          </span>
        </span>
      );
      
      lastIndex = blank.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PreviewHeader 
        title="Fill in the Blanks"
        totalItems={sentences.length}
        currentItem={currentSentence}
      />
      
      <ProgressBar current={currentSentence} total={sentences.length} />

      {/* Sentence Card */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        {sentence.sentenceImage && (
          <div className="mb-6">
            <img
              src={sentence.sentenceImage}
              alt="Sentence"
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
          </div>
        )}
        
        <div className="text-xl leading-relaxed text-gray-900 mb-6">
          {renderSentenceWithBlanks(sentence.text, sentence.blanks)}
        </div>

        <PreviewNavigation
          current={currentSentence}
          total={sentences.length}
          onPrevious={() => setCurrentSentence(Math.max(0, currentSentence - 1))}
          onNext={() => setCurrentSentence(Math.min(sentences.length - 1, currentSentence + 1))}
        />
      </div>

      <PreviewOverview
        items={sentences}
        currentIndex={currentSentence}
        onSelect={setCurrentSentence}
        itemTitle="Sentence"
      />
    </div>
  );
}

// FlashCards Preview Component
export function FlashCardsPreview({ cards }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const card = cards[currentCard];

  if (!card || cards.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No cards to preview</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PreviewHeader 
        title="Flash Cards"
        totalItems={cards.length}
        currentItem={currentCard}
      />
      
      <ProgressBar current={currentCard} total={cards.length} />

      {/* Card */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <div className="flex flex-col items-center">
          <div 
            className="w-full max-w-md h-64 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl shadow-lg cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center text-white">
                <div className="text-2xl font-bold mb-4">
                  {isFlipped ? (card.back || "Back text will appear here") : (card.front || "Front text will appear here")}
                </div>
                <div className="text-sm opacity-75">
                  {isFlipped ? "Back" : "Front"} - Click to flip
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Flip Card
            </button>
          </div>
        </div>

        <div className="mt-8">
          <PreviewNavigation
            current={currentCard}
            total={cards.length}
            onPrevious={() => {
              setCurrentCard(Math.max(0, currentCard - 1));
              setIsFlipped(false);
            }}
            onNext={() => {
              setCurrentCard(Math.min(cards.length - 1, currentCard + 1));
              setIsFlipped(false);
            }}
          />
        </div>
      </div>

      <PreviewOverview
        items={cards}
        currentIndex={currentCard}
        onSelect={(index) => {
          setCurrentCard(index);
          setIsFlipped(false);
        }}
        itemTitle="Card"
      />
    </div>
  );
}

// Other preview components for remaining exercise types...
export function MatchingPreview({ pairs }) {
  if (!pairs || pairs.length === 0) {
    return (
      <SimpleExercisePreview title="Matching Exercise">
        <p className="text-gray-500 text-center">No pairs to preview</p>
      </SimpleExercisePreview>
    );
  }

  return (
    <SimpleExercisePreview title="Matching Exercise">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Match the items below:
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 mb-3">Left Items</h4>
            {pairs.map((pair, index) => (
              <div
                key={`left-${index}`}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                {pair.left || `Left item ${index + 1}`}
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 mb-3">Right Items</h4>
            {pairs.map((pair, index) => (
              <div
                key={`right-${index}`}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                {pair.right || `Right item ${index + 1}`}
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Matches with Left {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SimpleExercisePreview>
  );
}

export function ArrangeWordsPreview({ sentences }) {
  if (!sentences || sentences.length === 0) {
    return (
      <SimpleExercisePreview title="Arrange Words">
        <p className="text-gray-500 text-center">No sentences to preview</p>
      </SimpleExercisePreview>
    );
  }

  const [currentSentence, setCurrentSentence] = useState(0);
  const sentence = sentences[currentSentence];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PreviewHeader 
        title="Arrange Words"
        totalItems={sentences.length}
        currentItem={currentSentence}
      />
      
      <ProgressBar current={currentSentence} total={sentences.length} />

      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Arrange these words to form a correct sentence:
        </h3>
        
        {/* Scrambled Words */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Words to arrange:</h4>
          <div className="flex flex-wrap gap-2">
            {sentence?.words?.map((word, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-gray-800 cursor-default"
              >
                {word}
              </div>
            )) || <span className="text-gray-500">No words available</span>}
          </div>
        </div>
        
        {/* Correct Answer */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Correct sentence:</h4>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-800 font-medium">
              {sentence?.correct || "Correct sentence will appear here"}
            </span>
          </div>
        </div>

        <PreviewNavigation
          current={currentSentence}
          total={sentences.length}
          onPrevious={() => setCurrentSentence(Math.max(0, currentSentence - 1))}
          onNext={() => setCurrentSentence(Math.min(sentences.length - 1, currentSentence + 1))}
        />
      </div>

      <PreviewOverview
        items={sentences}
        currentIndex={currentSentence}
        onSelect={setCurrentSentence}
        itemTitle="Sentence"
      />
    </div>
  );
}

export function TranslationPreview({ items }) {
  if (!items || items.length === 0) {
    return (
      <SimpleExercisePreview title="Translation Exercise">
        <p className="text-gray-500 text-center">No translations to preview</p>
      </SimpleExercisePreview>
    );
  }

  const [currentItem, setCurrentItem] = useState(0);
  const item = items[currentItem];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PreviewHeader 
        title="Translation Exercise"
        totalItems={items.length}
        currentItem={currentItem}
      />
      
      <ProgressBar current={currentItem} total={items.length} />

      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Source */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Translate from English:</h4>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-800 text-lg">
                {item?.source || "Source text will appear here"}
              </span>
            </div>
          </div>
          
          {/* Target */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">
              Correct translation ({item?.language || "Portuguese"}):
            </h4>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 text-lg">
                {item?.target || "Target translation will appear here"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PreviewNavigation
            current={currentItem}
            total={items.length}
            onPrevious={() => setCurrentItem(Math.max(0, currentItem - 1))}
            onNext={() => setCurrentItem(Math.min(items.length - 1, currentItem + 1))}
          />
        </div>
      </div>

      <PreviewOverview
        items={items}
        currentIndex={currentItem}
        onSelect={setCurrentItem}
        itemTitle="Translation"
      />
    </div>
  );
}

export function ExternalLinkPreview({ content }) {
  return (
    <SimpleExercisePreview title="External Link Exercise">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            External Exercise Link
          </h3>
          <p className="text-gray-600 mb-4">
            Students will be redirected to an external platform to complete this exercise.
          </p>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
            <span className="text-gray-700 font-mono text-sm">
              {content?.url || "No URL configured"}
            </span>
          </div>
          
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            External Link Exercise
          </div>
        </div>
      </div>
    </SimpleExercisePreview>
  );
}