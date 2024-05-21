# Quizzie App

Quizzie is a React application that allows teachers to create various types of questions (essay, multiple-choice single answer, multiple-choice multiple answers) and students to answer them. The application leverages Firebase for authentication and data storage.

## Features

- **User Authentication**: Users can register and login with their email and password. There are two roles: Student and Teacher.
- **Teacher Dashboard**: Teachers can create questions and view students' answers.
- **Student Dashboard**: Students can answer questions, navigate between them, and submit their answers. Once all questions are answered, students are notified that they have completed the exam.
- **Text-to-Speech**: Students can listen to the questions and their answers using the built-in text-to-speech feature.
- **Speech-to-Text**: Students can use speech recognition to input their answers.

## Screenshots

![Teacher Dashboard](./screenshots/teacher-dashboard.png)
![Student Dashboard](./screenshots/student-dashboard.png)

## Technologies Used

- **React**: Frontend framework.
- **Firebase**: Backend service for authentication and Firestore database.
- **React Router**: For navigation.
- **CSS**: For styling.

## Setup and Installation

### Prerequisites

- Node.js and npm installed.
- Firebase project setup.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/quizzie.git
    cd quizzie
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Email/Password authentication in the Firebase Authentication section.
   - Create a Firestore database and set the security rules as follows:
     ```plaintext
     service cloud.firestore {
       match /databases/{database}/documents {
         // Allow read/write access to authenticated users
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         match /questions/{questionId} {
           allow read, write: if request.auth != null;
         }
         match /answers/{answerId} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

4. Add your Firebase configuration:
   - Create a `firebaseConfig.js` file in the `src` folder with your Firebase configuration:
     ```javascript
     import { initializeApp } from "firebase/app";
     import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
     import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };

     const app = initializeApp(firebaseConfig);
     const auth = getAuth(app);
     const db = getFirestore(app);

     export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, collection, addDoc, getDocs, doc, setDoc, getDoc };
     ```

5. Start the development server:
    ```bash
    npm start
    ```

6. Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Usage

### Teacher

1. Register or login as a teacher.
2. Create questions using the teacher dashboard.
3. View students' answers by selecting a student from the dropdown menu.

### Student

1. Register or login as a student.
2. Answer the questions displayed in the student dashboard.
3. Submit your answers. Once all questions are answered, you will see a completion message.
