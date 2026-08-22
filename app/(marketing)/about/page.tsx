export default function About() {
  return (
    <main className="max-w-sm mx-auto px-4 py-12 text-center text-gray-700">
      <h1 className="text-xl font-bold mb-3">QuizMe</h1>
      
      <p className="text-sm">
        Platform kuis sederhana untuk menguji pengetahuanmu.
      </p>
      <p className="text-xs text-gray-400 mt-1 italic">
        A simple quiz platform to test your knowledge.
      </p>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Contact / Kontak</p>
        <a 
          href="mailto:riofsx@gmail.com" 
          className="text-sm font-medium text-black hover:underline"
        >
          riofsx@gmail.com
        </a>
      </div>
    </main>
  );
}
