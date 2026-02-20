import { Link, NavLink } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand">
          <span className="site-header__title">Pearson Key Dates</span>
        </Link>
        <nav className="site-header__nav">
          <NavLink to="/" end className={({ isActive }) => `site-header__nav-link${isActive ? ' active' : ''}`}>
            Calendar
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `site-header__nav-link${isActive ? ' active' : ''}`}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
