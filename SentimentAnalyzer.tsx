import React, { useState, useEffect, useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Download, RotateCcw } from 'lucide-react';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  positiveScore: number;
  negativeScore: number;
  neutralScore: number;
  wordCount: number;
  timestamp: number;
}

interface WordSentiment {
  word: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

const SentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [history, setHistory] = useState<Array<{ text: string; result: SentimentResult }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sentiment word lists (simplified for demo - in production, you'd use a larger dataset)
  const positiveWords = [
    'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great', 'happy',
    'incredible', 'love', 'perfect', 'wonderful', 'good', 'best', 'beautiful',
    'outstanding', 'superb', 'magnificent', 'delightful', 'pleasant', 'satisfied',
    'impressive', 'remarkable', 'exceptional', 'marvelous', 'terrific', 'fabulous',
    'gorgeous', 'splendid', 'stellar', 'phenomenal', 'enjoy', 'like', 'appreciate',
    'adore', 'treasure', 'cherish', 'celebrate', 'success', 'victory', 'triumph'
  ];

  const negativeWords = [
    'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'disgusting',
    'disappointing', 'frustrating', 'annoying', 'angry', 'sad', 'depressing',
    'pathetic', 'useless', 'worthless', 'dreadful', 'appalling', 'shocking',
    'disturbing', 'offensive', 'unacceptable', 'ridiculous', 'stupid', 'idiotic',
    'dislike', 'despise', 'detest', 'loathe', 'failure', 'disaster', 'catastrophe',
    'nightmare', 'regret', 'mistake', 'problem', 'issue', 'trouble', 'difficulty'
  ];

  const neutralWords = [
    'okay', 'fine', 'average', 'normal', 'standard', 'typical', 'usual',
    'regular', 'common', 'ordinary', 'moderate', 'fair', 'decent', 'adequate'
  ];

  const analyzeSentiment = useMemo(() => {
    return (inputText: string): SentimentResult => {
      if (!inputText.trim()) {
        return {
          sentiment: 'neutral',
          confidence: 0,
          positiveScore: 0,
          negativeScore: 0,
          neutralScore: 1,
          wordCount: 0,
          timestamp: Date.now()
        };
      }

      const words = inputText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;

      words.forEach(word => {
        if (positiveWords.includes(word)) {
          positiveCount++;
        } else if (negativeWords.includes(word)) {
          negativeCount++;
        } else if (neutralWords.includes(word)) {
          neutralCount++;
        }
      });

      const totalSentimentWords = positiveCount + negativeCount + neutralCount;
      const totalWords = words.length;

      let sentiment: 'positive' | 'negative' | 'neutral';
      let confidence: number;

      if (positiveCount > negativeCount && positiveCount > neutralCount) {
        sentiment = 'positive';
        confidence = Math.min(0.9, (positiveCount / totalWords) * 2);
      } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
        sentiment = 'negative';
        confidence = Math.min(0.9, (negativeCount / totalWords) * 2);
      } else {
        sentiment = 'neutral';
        confidence = totalSentimentWords === 0 ? 0.5 : Math.min(0.8, 0.3 + (neutralCount / totalWords));
      }

      const positiveScore = positiveCount / Math.max(totalWords, 1);
      const negativeScore = negativeCount / Math.max(totalWords, 1);
      const neutralScore = 1 - positiveScore - negativeScore;

      return {
        sentiment,
        confidence,
        positiveScore,
        negativeScore,
        neutralScore,
        wordCount: totalWords,
        timestamp: Date.now()
      };
    };
  }, [positiveWords, negativeWords, neutralWords]);

  const getWordSentiments = useMemo(() => {
    return (inputText: string): WordSentiment[] => {
      const words = inputText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      return words.map(word => {
        if (positiveWords.includes(word)) {
          return { word, sentiment: 'positive' as const, score: 1 };
        } else if (negativeWords.includes(word)) {
          return { word, sentiment: 'negative' as const, score: -1 };
        } else if (neutralWords.includes(word)) {
          return { word, sentiment: 'neutral' as const, score: 0 };
        }
        return { word, sentiment: 'neutral' as const, score: 0 };
      });
    };
  }, [positiveWords, negativeWords, neutralWords]);

  useEffect(() => {
    if (text.trim()) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const analysisResult = analyzeSentiment(text);
        setResult(analysisResult);
        setIsAnalyzing(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setResult(null);
      setIsAnalyzing(false);
    }
  }, [text, analyzeSentiment]);

  const handleAnalyze = () => {
    if (text.trim() && result) {
      const newEntry = { text, result };
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 analyses
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setHistory([]);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      analyses: history
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiment-analysis-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-600';
      case 'negative': return 'text-red-600';
      default: return 'text-amber-600';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-50 border-emerald-200';
      case 'negative': return 'bg-red-50 border-red-200';
      default: return 'bg-amber-50 border-amber-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-5 h-5" />;
      case 'negative': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const wordSentiments = text ? getWordSentiments(text) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Sentiment Analyzer
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Analyze the emotional tone of your text using advanced AI algorithms. 
            Get real-time insights into sentiment patterns and confidence scores.
          </p>
        </div>

        {/* Main Analysis Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6">
            <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 mb-3">
              Enter text to analyze
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here for sentiment analysis..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || !result}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Brain className="w-4 h-4" />
                Add to History
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All
              </button>
              {history.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </button>
              )}
            </div>
          </div>

          {/* Real-time Results */}
          {(result || isAnalyzing) && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Analyzing sentiment...</span>
                </div>
              ) : result && (
                <div className="space-y-6">
                  {/* Main Result */}
                  <div className={`p-6 rounded-xl border-2 ${getSentimentBg(result.sentiment)} transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${getSentimentColor(result.sentiment)}`}>
                          {getSentimentIcon(result.sentiment)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold capitalize">{result.sentiment} Sentiment</h3>
                          <p className="text-gray-600">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Words analyzed</p>
                        <p className="text-2xl font-bold text-gray-800">{result.wordCount}</p>
                      </div>
                    </div>

                    {/* Sentiment Distribution */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-600 font-medium">Positive</span>
                        <span>{(result.positiveScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.positiveScore * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-600 font-medium">Negative</span>
                        <span>{(result.negativeScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.negativeScore * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-600 font-medium">Neutral</span>
                        <span>{(result.neutralScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.neutralScore * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Word Highlighting */}
                  {wordSentiments.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Word-level Analysis</h4>
                      <div className="flex flex-wrap gap-2">
                        {wordSentiments.map((wordSent, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              wordSent.sentiment === 'positive' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : wordSent.sentiment === 'negative' 
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            {wordSent.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analysis History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Analysis History</h2>
              <p className="text-gray-600">Review your previous sentiment analyses</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {history.map((entry, index) => (
                <div key={index} className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`${getSentimentColor(entry.result.sentiment)}`}>
                        {getSentimentIcon(entry.result.sentiment)}
                      </div>
                      <span className={`font-semibold capitalize ${getSentimentColor(entry.result.sentiment)}`}>
                        {entry.result.sentiment}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({(entry.result.confidence * 100).toFixed(1)}% confidence)
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {entry.text.length > 200 ? `${entry.text.substring(0, 200)}...` : entry.text}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="text-emerald-600">
                      Positive: {(entry.result.positiveScore * 100).toFixed(1)}%
                    </span>
                    <span className="text-red-600">
                      Negative: {(entry.result.negativeScore * 100).toFixed(1)}%
                    </span>
                    <span className="text-amber-600">
                      Neutral: {(entry.result.neutralScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
