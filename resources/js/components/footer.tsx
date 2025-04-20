import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Footer() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <footer className="fixed bottom-0 w-full z-50 bg-ai-dark/60 backdrop-blur-lg shadow-lg">
    
    </footer>
  );
}
