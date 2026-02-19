import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { analyzeStatement } from './services/geminiService';

interface AnalysisResult {
  currency: string;
  csv: string;
}

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeStatement(imageFile);
      setAnalysisResult(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError('An unknown error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setImageDataUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Bank Statement Analyzer
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Extract transaction data from bank statements into clean CSV using Gemini.
          </p>
        </header>

        <main className="bg-slate-800/50 rounded-2xl shadow-2xl p-6 backdrop-blur-sm border border-slate-700">
          <FileUpload
            onFileChange={handleFileChange}
            imageDataUrl={imageDataUrl}
            file={imageFile}
          />
          
          {!analysisResult && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={!imageFile || isLoading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isLoading ? <Spinner /> : 'Analyze Statement'}
              </button>
              {imageFile && (
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors duration-300"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {isLoading && !analysisResult && (
            <div className="text-center p-8">
                <div className="flex justify-center items-center mb-4">
                    <Spinner />
                </div>
                <p className="text-lg text-slate-400 animate-pulse">Analyzing your statement... this may take a moment.</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {analysisResult && (
            <div className="mt-8">
              <ResultDisplay
                currency={analysisResult.currency}
                csvData={analysisResult.csv}
              />
              <div className="mt-6 text-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Analyze Another Statement
                </button>
              </div>
            </div>
          )}
        </main>
        <footer className="text-center mt-8 text-slate-500">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;