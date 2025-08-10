import { useState } from "react";

export default function ExternalLink({
  content,
  onChange,
  mode = "editor",
  onComplete,
}) {
  const [url, setUrl] = useState(content?.url || "");

  const updateContent = (newUrl) => {
    setUrl(newUrl);
    if (onChange) {
      onChange({ url: newUrl });
    }
  };

  if (mode === "player") {
    return <ExternalLinkPlayer url={url} onComplete={onComplete} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          External Link Exercise
        </h3>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to create external link exercises:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • Paste the URL of your external exercise (Quizlet, Kahoot, Google
            Forms, etc.)
          </p>
          <p>
            • Students will click the link to complete the exercise externally
          </p>
          <p>• Example: https://quizlet.com/your-study-set</p>
        </div>
      </div>

      {/* URL Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label
          htmlFor="exerciseUrl"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Exercise URL *
        </label>
        <input
          type="url"
          id="exerciseUrl"
          value={url}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="https://quizlet.com/your-exercise-link"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-2">
          Students will be redirected to this URL to complete the exercise
        </p>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Student View Preview:
          </p>
          <div className="bg-white p-4 rounded border border-gray-200">
            {url ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <p className="text-gray-700 mb-4">
                    Click the link below to complete this exercise:
                  </p>
                  <div className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-lg">
                    <span className="mr-2">🚀</span>
                    Start Exercise
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Opens: {url}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center italic">
                Enter a URL to see how students will see this exercise
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Player component for students
function ExternalLinkPlayer({ url, onComplete }) {
  const handleLinkClick = () => {
    // Mark as completed when student clicks the link
    if (onComplete) {
      onComplete(100); // 100% for clicking the link
    }
  };

  if (!url) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Link Available
          </h3>
          <p className="text-gray-600">
            This exercise doesn't have a valid link configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
        <div className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔗</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          External Exercise
        </h2>

        <p className="text-gray-600 mb-8">
          Click the link below to complete this exercise. It will open in a new
          tab.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="inline-flex items-center px-8 py-4 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors shadow-glow-blue text-lg font-medium"
        >
          <span className="mr-2">🚀</span>
          Start Exercise
        </a>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Complete the exercise and return here. Your
            progress will be automatically marked.
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-4">Link: {url}</p>
      </div>
    </div>
  );
}
