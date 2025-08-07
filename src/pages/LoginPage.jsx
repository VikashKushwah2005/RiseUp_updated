import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Add this import
import { auth } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name || !age || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please enter email and password.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        // Sign Up
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        const ageNum = parseInt(age, 10);
        const ageGroup = ageNum < 18 ? '12-18' : ageNum <= 25 ? '18-25' : '25+';
        const newUserProfile = {
          id: userCred.user.uid,
          name: userCred.user.displayName,
          email: userCred.user.email,
          age: ageNum,
          ageGroup,
          createdAt: new Date().toISOString(),
          plan: [],
          streak: 0,
          taskHistory: {}
        };
        onLogin(newUserProfile);
        navigate('/questionnaire');
      } else {
        // Login
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let userProfile;
        if (userDoc.exists()) {
          userProfile = userDoc.data();
        } else {
          // fallback if no Firestore doc found
          userProfile = {
            id: user.uid,
            name: user.displayName || '',
            email: user.email,
            age: '',
            ageGroup: '',
            createdAt: user.metadata?.creationTime || '',
            plan: [],
            streak: 0,
            taskHistory: {}
          };
        }
        onLogin(userProfile);
        navigate('/dashboard');
      }
    } catch (firebaseError) {
      console.error(firebaseError);
      setError(firebaseError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-stone-100 p-6"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl font-bold text-center text-stone-800"
        >
          {mode === 'signup' ? 'Create Your Sanctuary' : 'Welcome Back'}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center gap-4 mb-2"
        >
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${mode === 'signup' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}
            onClick={() => setMode('signup')}
            disabled={loading}
          >
            Sign Up
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${mode === 'login' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700'}`}
            onClick={() => setMode('login')}
            disabled={loading}
          >
            Login
          </button>
        </motion.div>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="space-y-6"
          onSubmit={handleAuth}
        >
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-stone-700 font-semibold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  disabled={loading}
                  required={mode === 'signup'}
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-2" htmlFor="age">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="12"
                  max="99"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  disabled={loading}
                  required={mode === 'signup'}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-stone-700 font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-stone-700 font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              disabled={loading}
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition duration-300 disabled:bg-stone-400"
          >
            {loading ? (mode === 'signup' ? 'Creating Account...' : 'Logging In...') : (mode === 'signup' ? 'Sign Up' : 'Login')}
          </button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}