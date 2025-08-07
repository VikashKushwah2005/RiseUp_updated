import React, { useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import emailjs from '@emailjs/browser';

export default function BookingPage({ doctor, setPage }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // optional UX

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      date: formData.get('date'),
      time: formData.get('time'),
      doctor_name: doctor?.name || 'Unknown Doctor',
      doctor_email: doctor?.email || 'fallback@example.com',
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        data,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        setSubmitted(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to send email:', err);
        alert('There was an error sending the appointment request. Please try again.');
        setLoading(false);
      });
  };

  if (!doctor) return <LoadingScreen text="Loading..." />;

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-stone-100 p-6">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        {submitted ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">Request Sent!</h2>
            <p className="text-stone-600">
              Your appointment request for <span className="font-bold">{doctor.name}</span> has been submitted.
              They will contact you via email to confirm the details.
            </p>
            <button
              onClick={() => setPage('consult')}
              className="mt-6 bg-amber-600 text-white font-bold py-2 px-6 rounded-full hover:bg-amber-700 transition"
            >
              Back to Consultants
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-stone-800">Book Appointment</h2>
            <p className="text-center text-stone-600">
              Request a session with <span className="font-bold text-amber-700">{doctor.name}</span>
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-bold text-stone-600 block">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className="w-full p-3 mt-2 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-stone-600 block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 mt-2 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-bold text-stone-600 block">Preferred Date</label>
                  <input
                    type="date"
                    name="date"
                    className="w-full p-3 mt-2 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold text-stone-600 block">Preferred Time</label>
                  <input
                    type="time"
                    name="time"
                    className="w-full p-3 mt-2 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full py-3 font-bold text-white rounded-lg transition duration-300 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
