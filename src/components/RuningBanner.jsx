import React from 'react'

const nutrientWords = [
  'No Palm Oil',
  'No Added Sugar',
  'High Protein',
  'Gluten-Free',
  'Lab Tested',
  'GMP Certified',
  '100% Vegan',
  'Naturally Flavored',
]

const RunningBanner = ({ className }) => {
  // Duplicate the array multiple times for seamless scrolling
  const bannerItems = [...nutrientWords, ...nutrientWords, ...nutrientWords]

  return (
    <div className={`relative w-full overflow-hidden bg-[#4BB0DD] py-6 text-white sm:w-screen sm:-mx-[50vw] sm:left-1/2 sm:right-1/2 sm:py-8 ${className}`}>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
      <div className="flex animate-marquee whitespace-nowrap">
        {bannerItems.map((text, index) => (
          <span 
            key={index} 
            className="mx-4 border-l border-white/20 pl-4 text-lg font-semibold first:border-l-0 font-family-antonio first:pl-0 sm:mx-6 sm:pl-6 sm:text-3xl"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}

export default RunningBanner