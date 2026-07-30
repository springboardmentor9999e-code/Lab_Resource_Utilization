import { Link } from 'react-router-dom';
import { MdScience, MdArrowBack } from 'react-icons/md';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MdScience className="text-4xl text-brand-400" />
        </div>
        <h1 className="text-6xl font-extrabold text-brand-500 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <MdArrowBack /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
