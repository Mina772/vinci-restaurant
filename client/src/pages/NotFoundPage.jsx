import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-8xl font-serif text-gold">404</h1>
      <p className="text-xl text-gray-300">This page has left the kitchen.</p>
      <Link to="/" className="btn-gold">Back to Home</Link>
    </div>
  );
}
