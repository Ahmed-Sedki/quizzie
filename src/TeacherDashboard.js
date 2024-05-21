import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signOut, db, addDoc, collection, getDocs } from './firebaseConfig';
import './TeacherDashboard.css'; // Import the CSS file

const TeacherDashboard = () => {
  const [questionType, setQuestionType] = useState('essay');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [view, setView] = useState('create'); // State to toggle between views
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const answersSnapshot = await getDocs(collection(db, 'answers'));
      const answersList = answersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const studentsList = usersSnapshot.docs.filter(doc => doc.data().role === 'student').map(doc => ({ id: doc.id, ...doc.data() }));

      setQuestions(questionsList);
      setAnswers(answersList);
      setStudents(studentsList);
    };

    fetchQuestionsAndAnswers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const newQuestion = {
      type: questionType,
      question: question,
      options: questionType === 'mcq' || questionType === 'multiple' ? options : [],
      correctAnswers: questionType === 'multiple' ? correctAnswers : questionType === 'mcq' ? [correctAnswers[0]] : [],
    };

    try {
      await addDoc(collection(db, 'questions'), newQuestion);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswers([]);
      alert('Question added successfully');
      // Fetch questions again to update the list
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsList);
    } catch (error) {
      console.error("Error adding question", error);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (value) => {
    if (questionType === 'mcq') {
      setCorrectAnswers([value]);
    } else {
      const newCorrectAnswers = correctAnswers.includes(value)
        ? correctAnswers.filter((ans) => ans !== value)
        : [...correctAnswers, value];
      setCorrectAnswers(newCorrectAnswers);
    }
  };

  const getAnswersForQuestion = (questionId, studentId) => {
    return answers.filter((answer) => answer.questionId === questionId && answer.studentId === studentId);
  };

  return (
    <div className="teacher-dashboard-container">
      <h1>Teacher Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <div className="navbar">
        <button onClick={() => setView('create')}>Create Question</button>
        <button onClick={() => setView('view')}>View Answers</button>
      </div>

      {view === 'create' && (
        <>
          <h2>Add a new question</h2>
          <form onSubmit={handleAddQuestion}>
            <div>
              <label>
                Question Type:
                <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                  <option value="essay">Essay</option>
                  <option value="mcq">MCQ (Single Correct Answer)</option>
                  <option value="multiple">MCQ (Multiple Correct Answers)</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                Question:
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} required />
              </label>
            </div>
            {(questionType === 'mcq' || questionType === 'multiple') && (
              <div>
                {options.map((option, index) => (
                  <div key={index} className="option">
                    <label>
                      Option {index + 1}:
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
            {questionType === 'mcq' && (
              <div>
                <label>
                  Correct Answer:
                  <select value={correctAnswers[0]} onChange={(e) => handleCorrectAnswerChange(e.target.value)}>
                    {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {questionType === 'multiple' && (
              <div>
                <label>Correct Answers:</label>
                {options.map((option, index) => (
                  <div key={index} className="option">
                    <label>
                      <input
                        type="checkbox"
                        checked={correctAnswers.includes(option)}
                        onChange={() => handleCorrectAnswerChange(option)}
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <button type="submit">Add Question</button>
          </form>
        </>
      )}

      {view === 'view' && (
        <>
          <h2>Select a Student to View Answers</h2>
          <div>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div>
              <h2>Questions and Answers for {students.find(student => student.id === selectedStudent)?.name}</h2>
              {questions.map((question, index) => (
                <div key={index}>
                  <h3>{question.question}</h3>
                  {question.options.map((option, i) => (
                    <div key={i}>
                      <strong>Option {i + 1}: </strong>{option}
                    </div>
                  ))}
                  <div>
                    <strong>Correct Answers: </strong>{question.correctAnswers.join(', ')}
                  </div>
                  <div>
                    <h4>Student Answers</h4>
                    {getAnswersForQuestion(question.id, selectedStudent).map((answer, i) => (
                      <div key={i} className="student-answer">
                        <p>{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
