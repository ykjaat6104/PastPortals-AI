import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Crown,
  Sword,
  Pyramid,
  Columns,
  Castle,
  Scroll,
  Globe,
  Mountain
} from 'lucide-react';
import { useAPI } from '../contexts/APIContext';
import { useNotification } from '../contexts/NotificationContext';

const QuickQuestions = () => {
  const navigate = useNavigate();
  const { askQuestion, isConfigured } = useAPI();
  const { showInfo, showError } = useNotification();
  const [loadingQuestion, setLoadingQuestion] = useState(null);

  const questions = [
    {
      id: 'roman-empire',
      text: 'Tell me about the Roman Empire',
      icon: Columns,
      category: 'Ancient Civilizations',
      color: 'var(--primary-500)',
      gradient: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))'
    },
    {
      id: 'egyptian-pyramids',
      text: 'How were the Egyptian pyramids built?',
      icon: Pyramid,
      category: 'Ancient Wonders',
      color: 'var(--accent-500)',
      gradient: 'linear-gradient(135deg, var(--accent-400), var(--accent-600))'
    },
    {
      id: 'medieval-europe',
      text: 'What was life like in medieval Europe?',
      icon: Castle,
      category: 'Medieval Period',
      color: 'var(--secondary-500)',
      gradient: 'linear-gradient(135deg, var(--secondary-400), var(--secondary-600))'
    },
    {
      id: 'world-war-ii',
      text: 'What caused World War II?',
      icon: Sword,
      category: 'Modern History',
      color: 'var(--error-500)',
      gradient: 'linear-gradient(135deg, var(--error-400), var(--error-600))'
    },
    {
      id: 'renaissance',
      text: 'Tell me about the Renaissance period',
      icon: Scroll,
      category: 'Cultural Movements',
      color: 'var(--warning-500)',
      gradient: 'linear-gradient(135deg, var(--warning-400), var(--warning-600))'
    },
    {
      id: 'great-wall',
      text: 'Why was the Great Wall of China built?',
      icon: Mountain,
      category: 'Engineering Marvels',
      color: 'var(--success-500)',
      gradient: 'linear-gradient(135deg, var(--success-400), var(--success-600))'
    },
    {
      id: 'alexander-great',
      text: 'Who was Alexander the Great?',
      icon: Crown,
      category: 'Historical Figures',
      color: 'var(--primary-700)',
      gradient: 'linear-gradient(135deg, var(--primary-500), var(--primary-800))'
    },
    {
      id: 'industrial-revolution',
      text: 'How did the Industrial Revolution change the world?',
      icon: Globe,
      category: 'Transformative Periods',
      color: 'var(--neutral-600)',
      gradient: 'linear-gradient(135deg, var(--neutral-500), var(--neutral-700))'
    }
  ];

  const handleQuestionClick = async (question) => {
    if (!isConfigured) {
      showError('Please configure your API key first to ask questions');
      return;
    }

    setLoadingQuestion(question.id);
    
    try {
      // Navigate to explore page with the question
      navigate('/explore', { 
        state: { 
          question: question.text,
          autoAsk: true 
        } 
      });
    } catch (error) {
      showError('Failed to process question');
      console.error('Question error:', error);
    } finally {
      setLoadingQuestion(null);
    }
  };

  return (
    <div className="quick-questions">
      <div className="questions-grid">
        {questions.map((question, index) => (
          <motion.button
            key={question.id}
            className="question-card"
            style={{
              background: question.gradient,
              '--hover-color': question.color
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.1 * index, 
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: `0 10px 30px ${question.color}40`
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuestionClick(question)}
            disabled={loadingQuestion === question.id}
          >
            <div className="question-icon">
              {loadingQuestion === question.id ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⏳
                </motion.div>
              ) : (
                <question.icon className="w-6 h-6" />
              )}
            </div>
            
            <div className="question-content">
              <span className="question-category">{question.category}</span>
              <span className="question-text">{question.text}</span>
            </div>

            <motion.div
              className="question-hover-effect"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.div>
          </motion.button>
        ))}
      </div>

      <motion.div 
        className="questions-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p>💡 Click any question to start exploring with AI-powered insights</p>
      </motion.div>
    </div>
  );
};

export default QuickQuestions;