import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signOut, db, collection, getDocs, getDoc, doc, addDoc } from './firebaseConfig';
import './StudentDashboard.css'; // Import the CSS file

const StudentDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [studentName, setStudentName] = useState('');
  const [examCompleted, setExamCompleted] = useState(false); // State to track exam completion
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsList);
    };

    const fetchStudentName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setStudentName(userDoc.data().name);
        }
      }
    };

    fetchQuestions();
    fetchStudentName();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];

    const studentAnswer = {
      questionId: currentQuestion.id,
      answer,
      studentId: auth.currentUser.uid,
      studentName: studentName // Include student's name
    };

    try {
      await addDoc(collection(db, 'answers'), studentAnswer);
      setAnswer('');
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setExamCompleted(true); // Set exam as completed
      }
    } catch (error) {
      console.error("Error submitting answer", error);
    }
  };

  const handleTextToSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswer('');
    }
  };

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  if (examCompleted) {
    return (
      <div className="student-dashboard-container">
        <h1>Congratulations, {studentName}!</h1>
        <p>You have completed the exam.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="student-dashboard-container">
      <h1>Welcome, {studentName}</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>
        Question {currentQuestionIndex + 1}
        <img
          src="/speaker-icon.png" // Correct path to the image in the public directory
          alt="Speak question"
          className="speaker-icon"
          onClick={() => handleTextToSpeech(questions[currentQuestionIndex].question)}
        />
      </h2>
      <div>
        <p>{questions[currentQuestionIndex].question}</p>
        {questions[currentQuestionIndex].type !== 'essay' && (
          questions[currentQuestionIndex].options.map((option, index) => (
            <div key={index}>
              <label>
                <input
                  type={questions[currentQuestionIndex].type === 'mcq' ? 'radio' : 'checkbox'}
                  name="option"
                  value={option}
                  checked={answer.includes(option)}
                  onChange={(e) => {
                    if (questions[currentQuestionIndex].type === 'mcq') {
                      setAnswer(e.target.value);
                    } else {
                      setAnswer((prev) => {
                        if (e.target.checked) {
                          return [...prev, e.target.value];
                        } else {
                          return prev.filter((ans) => ans !== e.target.value);
                        }
                      });
                    }
                  }}
                />
                {option}
              </label>
            </div>
          ))
        )}
        {questions[currentQuestionIndex].type === 'essay' && (
          <div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <img
              src="/speaker-icon.png" // Correct path to the image in the public directory
              alt="Speak answer"
              className="speaker-icon"
              onClick={handleSpeechToText}
            />
          </div>
        )}
      </div>

      <button onClick={handleSubmitAnswer}>Submit Answer</button>
      <div className="navigation-buttons">
        <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
          Previous
        </button>
        <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
