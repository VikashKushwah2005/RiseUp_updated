import React from 'react';

export default function ConsultPage({ onBookAppointment }) {
  const doctors = [
    { name: "Dr. Ananya Sharma",email: "divyeshtechs@gmail.com" , specialization: "Mindfulness & Stress Management", bio: "Dr. Sharma integrates traditional meditation techniques with modern cognitive-behavioral therapy to help manage anxiety and stress.", avatar: "https://placehold.co/100x100/FFF7ED/6D4C41?text=AS" },
    { name: "Dr. Vikram Singh",email: "divyeshtechs@gmail.com" , specialization: "Career & Life Path Counseling", bio: "With 15 years of experience, Dr. Singh specializes in helping young adults navigate career choices and find a fulfilling life path.", avatar: "https://placehold.co/100x100/E8F5E9/388E3C?text=VS" },
    { name: "Dr. Priya Desai",email: "divyeshtechs@gmail.com" , specialization: "Relationship & Marital Harmony", bio: "Dr. Desai focuses on communication and understanding to help couples and individuals build stronger, healthier relationships.", avatar: "https://placehold.co/100x100/FCE4EC/C2185B?text=PD" },
    { name: "Dr. Rohan Joshi", email: "divyeshtechs@gmail.com" ,specialization: "Addiction & Habit Formation", bio: "Dr. Joshi provides compassionate support and evidence-based strategies for overcoming addiction and building positive habits.", avatar: "https://placehold.co/100x100/E3F2FD/1976D2?text=RJ" }
  ];
  return (
    <div className="container mx-auto max-w-5xl p-6 md:py-12">
      <h2 className="text-4xl font-bold text-center text-stone-800 mb-4">Consult Our Experts</h2>
      <p className="text-center text-stone-600 max-w-2xl mx-auto mb-12">Connect with experienced professionals who can provide guidance on your journey.</p>
      <div className="grid md:grid-cols-2 gap-8">
        {doctors.map((doctor, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <img src={doctor.avatar} alt={`Dr. ${doctor.name}`} className="w-24 h-24 rounded-full flex-shrink-0 border-4 border-amber-100" />
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-stone-800">{doctor.name}</h3>
              <p className="text-amber-700 font-semibold mb-2">{doctor.specialization}</p>
              <p className="text-stone-600 text-sm mb-4">{doctor.bio}</p>
              <button onClick={() => onBookAppointment(doctor)} className="bg-amber-600 text-white font-bold py-2 px-6 rounded-full hover:bg-amber-700 transition">Book Appointment</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}