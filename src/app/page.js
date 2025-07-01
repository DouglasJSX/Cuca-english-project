import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-xl flex items-center justify-center shadow-glow-blue">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-brand-blue-dark mb-4 animate-fade-in">
            English Exercises Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-in">
            A simple and efficient platform for English teachers to create and
            manage exercises for their students.
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-soft card-hover border border-pastel-blue/20">
            <div className="w-12 h-12 bg-pastel-blue rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-brand-blue-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-blue-dark mb-3">
              Multiple Exercise Types
            </h3>
            <p className="text-gray-600">
              Create ArrangeWords, FillBlank, FlashCards, Matching,
              MultipleChoice, and Translation exercises.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-soft card-hover border border-pastel-mint/20">
            <div className="w-12 h-12 bg-pastel-mint rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-brand-green-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-brand-green-dark mb-3">
              Class Management
            </h3>
            <p className="text-gray-600">
              Organize your students into classes and track their progress with
              ease.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-soft card-hover border border-pastel-peach/20">
            <div className="w-12 h-12 bg-pastel-peach rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-600 mb-3">
              Simple & Efficient
            </h3>
            <p className="text-gray-600">
              Clean, intuitive interface that focuses on what matters most -
              teaching and learning.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-12 shadow-soft border border-pastel-blue/20 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-blue-dark mb-6">
              Ready to practice English?
            </h2>
            <p className="text-gray-600 mb-8">
              Ask your teacher for the class code and start practicing with fun
              exercises!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/student/join"
                className="inline-flex items-center px-8 py-4 bg-brand-green hover:bg-brand-green-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-glow-green hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Join Your Class
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-4 border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-medium rounded-lg transition-all duration-200"
              >
                Teacher Login
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-pastel-blue/20">
          <p className="text-gray-500">
            English Exercises Manager © 2025. Built with care for educators.
          </p>
        </footer>
      </div>
    </div>
  );
}
