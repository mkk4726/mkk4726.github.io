export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Me</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Hello! I'm a passionate developer who loves to share knowledge and experiences through writing.
            This blog is my personal space where I document my journey in technology, share insights,
            and connect with fellow developers.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What I Write About</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Web development and modern frameworks</li>
            <li>Programming best practices and tips</li>
            <li>Technology trends and insights</li>
            <li>Personal projects and experiences</li>
            <li>Learning resources and tutorials</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            I'm always open to discussions, collaborations, and feedback. Feel free to reach out to me:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Email: your.email@example.com</li>
            <li>GitHub: <a href="https://github.com" className="text-blue-600 hover:text-blue-800">github.com/yourusername</a></li>
            <li>LinkedIn: <a href="https://linkedin.com" className="text-blue-600 hover:text-blue-800">linkedin.com/in/yourusername</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
} 