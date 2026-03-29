import { NextResponse } from 'next/server';

const quotes = [
  { content: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { content: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { content: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { content: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { content: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { content: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { content: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { content: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
  { content: "The more I read, the more I acquire, the more certain I am that I know nothing.", author: "Voltaire" },
  { content: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { content: "The only person who is educated is the one who has learned how to learn and change.", author: "Carl Rogers" },
  { content: "Knowledge is power. Information is liberating. Education is the premise of progress.", author: "Kofi Annan" },
  { content: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { content: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { content: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { content: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { content: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { content: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { content: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { content: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { content: "Study hard what interests you the most in the most undisciplined, irreverent way possible.", author: "Richard Feynman" },
];

export async function GET() {
  // Get a "random" quote based on the day (consistent for the day)
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  const quote = quotes[dayOfYear % quotes.length];
  
  return NextResponse.json({
    id: `quote-${dayOfYear}`,
    content: quote.content,
    author: quote.author,
    isBookmarked: false,
    createdAt: today.toISOString(),
  });
}

export async function POST() {
  // Get a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  return NextResponse.json({
    id: `quote-${Date.now()}`,
    content: quote.content,
    author: quote.author,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
  });
}
