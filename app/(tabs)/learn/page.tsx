'use client';

import { useEffect, useState } from 'react';
import { Quiz } from '@/components/Quiz';
import { getTodaysQuizAttempt, saveQuizAttempt } from '@/lib/api';
import type { QuizQuestion, QuizAttempt } from '@/types/models';

// Quiz questions pool
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the safe pH range for drinking water?",
    options: ["5.0 - 6.0", "6.5 - 8.5", "9.0 - 10.0", "3.0 - 4.0"],
    correctAnswer: 1,
    explanation: "The WHO recommends a pH range of 6.5-8.5 for drinking water as it's safe for human consumption.",
    category: "pH"
  },
  {
    id: 2,
    question: "What does high turbidity indicate?",
    options: ["Clean water", "Cloudy water", "Hot water", "Salty water"],
    correctAnswer: 1,
    explanation: "High turbidity means the water is cloudy or murky, often due to suspended particles.",
    category: "turbidity"
  },
  {
    id: 3,
    question: "What is the minimum dissolved oxygen level for healthy aquatic life?",
    options: ["1 mg/L", "3 mg/L", "5 mg/L", "10 mg/L"],
    correctAnswer: 2,
    explanation: "Most aquatic life requires at least 5 mg/L of dissolved oxygen to survive and thrive.",
    category: "oxygen"
  },
  {
    id: 4,
    question: "What should you do if you see discolored water?",
    options: ["Touch it to test", "Drink a small amount", "Avoid contact and report", "Ignore it"],
    correctAnswer: 2,
    explanation: "Always avoid contact with suspicious water and report it to local authorities.",
    category: "safety"
  },
  {
    id: 5,
    question: "What is the unit for measuring turbidity?",
    options: ["mg/L", "NTU", "°C", "pH"],
    correctAnswer: 1,
    explanation: "Turbidity is measured in Nephelometric Turbidity Units (NTU).",
    category: "turbidity"
  },
  {
    id: 6,
    question: "What can increase dissolved oxygen in water?",
    options: ["Pollution", "Warm temperature", "Algae photosynthesis", "High turbidity"],
    correctAnswer: 2,
    explanation: "Algae and aquatic plants produce oxygen through photosynthesis during daylight hours.",
    category: "oxygen"
  },
  {
    id: 7,
    question: "What does a pH of 7 indicate?",
    options: ["Acidic", "Neutral", "Basic", "Contaminated"],
    correctAnswer: 1,
    explanation: "A pH of 7 is neutral, meaning the water is neither acidic nor basic.",
    category: "pH"
  },
  {
    id: 8,
    question: "What's the best way to document water quality issues?",
    options: ["Just remember it", "Take photos from a safe distance", "Collect samples by hand", "Taste the water"],
    correctAnswer: 1,
    explanation: "Document issues with photos and location data while maintaining a safe distance.",
    category: "safety"
  },
  {
    id: 9,
    question: "What turbidity level is considered safe for drinking?",
    options: ["Above 10 NTU", "Below 1 NTU", "Above 50 NTU", "Any level"],
    correctAnswer: 1,
    explanation: "For drinking water, turbidity should be below 1 NTU, ideally below 0.3 NTU.",
    category: "turbidity"
  },
  {
    id: 10,
    question: "What happens when dissolved oxygen levels are too low?",
    options: ["Fish thrive", "Water becomes clearer", "Aquatic life suffers", "pH increases"],
    correctAnswer: 2,
    explanation: "Low dissolved oxygen levels can cause fish kills and harm the entire aquatic ecosystem.",
    category: "oxygen"
  },
  {
    id: 11,
    question: "What can cause water to become too acidic?",
    options: ["Pollution", "Natural minerals", "Sunlight", "Temperature"],
    correctAnswer: 0,
    explanation: "Pollution, particularly acid rain and industrial runoff, can make water more acidic.",
    category: "pH"
  },
  {
    id: 12,
    question: "Who should you contact about water quality concerns?",
    options: ["Nobody", "Only friends", "Local water authorities", "Social media only"],
    correctAnswer: 2,
    explanation: "Report concerns to local water management authorities who can investigate properly.",
    category: "safety"
  }
];

export default function LearnPage() {
  const [todaysAttempt, setTodaysAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const loadTodaysAttempt = async () => {
      try {
        const attempt = await getTodaysQuizAttempt();
        setTodaysAttempt(attempt);
        
        if (!attempt) {
          // Generate today's questions
          const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
          setCurrentQuestions(shuffled.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load quiz attempt:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysAttempt();
  }, []);

  const handleQuizComplete = async (score: number, total: number) => {
    try {
      const questionIds = currentQuestions.map(q => q.id);
      await saveQuizAttempt(score, total, questionIds);
      
      // Reload to show completion state
      const attempt = await getTodaysQuizAttempt();
      setTodaysAttempt(attempt);
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Learn About Water Quality</h1>
        <p className="text-gray-600">Test your knowledge with daily quizzes and earn XP!</p>
      </div>

      {todaysAttempt ? (
        <CompletedQuizView attempt={todaysAttempt} />
      ) : (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Today's Quiz</h2>
            <p className="text-blue-700 text-sm">
              Answer 3 questions about water quality to earn XP. You can only take the quiz once per day.
            </p>
          </div>
          
          <Quiz 
            questions={currentQuestions}
            onComplete={handleQuizComplete}
          />
        </div>
      )}

      {/* Educational content */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Water Quality Education</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <EducationCard
            title="Understanding pH"
            description="pH measures how acidic or basic water is. Safe drinking water should have a pH between 6.5 and 8.5."
            icon="🧪"
            color="bg-blue-50 border-blue-200"
          />
          
          <EducationCard
            title="Turbidity Basics"
            description="Turbidity measures water cloudiness. Clear water has low turbidity (< 1 NTU), while cloudy water indicates potential contamination."
            icon="👁️"
            color="bg-green-50 border-green-200"
          />
          
          <EducationCard
            title="Dissolved Oxygen"
            description="Fish and aquatic life need oxygen dissolved in water. Levels below 5 mg/L can stress or kill aquatic organisms."
            icon="🐟"
            color="bg-orange-50 border-orange-200"
          />
          
          <EducationCard
            title="Water Safety"
            description="Never touch or drink suspicious water. Report issues with photos and location data from a safe distance."
            icon="🛡️"
            color="bg-red-50 border-red-200"
          />
        </div>
      </div>
    </div>
  );
}

interface CompletedQuizViewProps {
  attempt: QuizAttempt;
}

function CompletedQuizView({ attempt }: CompletedQuizViewProps) {
  const percentage = (attempt.correct / attempt.total) * 100;
  
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-gray-600">
          You scored {attempt.correct} out of {attempt.total} ({Math.round(percentage)}%)
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">Come back tomorrow for a new quiz!</p>
        <div className="flex items-center justify-center space-x-2 text-sm">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-gray-700">XP earned today</span>
        </div>
      </div>
    </div>
  );
}

interface EducationCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
}

function EducationCard({ title, description, icon, color }: EducationCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}