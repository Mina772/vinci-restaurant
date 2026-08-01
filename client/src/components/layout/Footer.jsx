import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-ink-muted bg-ink-soft">
      <div className="container-lux grid gap-8 py-14 md:grid-cols-4">
        <div>
          <h3 className="text-2xl font-serif text-gold">VINCI</h3>
          <p className="mt-3 text-sm text-gray-400">
            Luxury dining, premium meals and effortless online ordering — crafted with passion.
          </p>
          <div className="mt-4 flex gap-4 text-gray-400">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><FiInstagram /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><FiFacebook /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><FiTwitter /></a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-gray-200">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/menu" className="hover:text-gold">Menu</Link></li>
            <li><Link to="/reservations" className="hover:text-gold">Reservations</Link></li>
            <li><Link to="/cart" className="hover:text-gold">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-gray-200">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-gold">About</a></li>
            <li><a href="#" className="hover:text-gold">Careers</a></li>
            <li><a href="#" className="hover:text-gold">Privacy</a></li>
            <li><a href="#" className="hover:text-gold">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-gray-200">Contact</h4>
          <p className="text-sm text-gray-400">12 Nile Corniche, Cairo</p>
          <p className="text-sm text-gray-400">+20 100 000 0000</p>
          <p className="text-sm text-gray-400">hello@vinci.test</p>
        </div>
      </div>
      <div className="border-t border-ink-muted py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} VINCI Restaurant. All rights reserved.
      </div>
    </footer>
  );
}
