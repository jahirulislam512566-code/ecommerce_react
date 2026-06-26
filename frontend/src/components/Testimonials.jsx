import React from 'react';

// ============================================================
// Testimonials Component
// ============================================================
export const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Ahmed',
      role: 'Verified Buyer',
      content: 'Absolutely love the quality! The fabric is premium and the fit is perfect. Will definitely shop again.',
      rating: 5,
      avatar: '👩',
    },
    {
      id: 2,
      name: 'Rafiq Hasan',
      role: 'Regular Customer',
      content: 'Fast delivery and excellent customer service. The products are exactly as described. Highly recommended!',
      rating: 5,
      avatar: '👨',
    },
    {
      id: 3,
      name: 'Tasnim Akter',
      role: 'Fashion Blogger',
      content: 'Forever has become my go-to for trendy fashion. The collection is always up-to-date with the latest styles.',
      rating: 5,
      avatar: '👩‍💼',
    },
  ];

  return (
    <div className="my-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">What Our Customers Say</h2>
        <p className="text-sm text-gray-500 mt-1">Real reviews from real customers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{testimonial.avatar}</div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{testimonial.name}</h4>
                <p className="text-xs text-gray-400">{testimonial.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">
                  {i < testimonial.rating ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;