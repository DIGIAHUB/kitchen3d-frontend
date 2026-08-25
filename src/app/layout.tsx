import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitchen 3D Limited — Kitchen Fitters Manchester",
  description: "Manchester's trusted kitchen fitters with 109 five-star reviews. Kitchen renovation, fitting & installation across Greater Manchester.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 font-sans">
        <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">Kitchen 3D Ltd</a>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="/about" className="hover:text-yellow-400">About</a>
            <a href="/services" className="hover:text-yellow-400">Services</a>
            <a href="/projects" className="hover:text-yellow-400">Projects</a>
            <a href="/testimonials" className="hover:text-yellow-400">Testimonials</a>
            <a href="/faqs" className="hover:text-yellow-400">FAQ&apos;s</a>
            <a href="/blogs" className="hover:text-yellow-400">Blogs</a>
            <a href="/contact" className="hover:text-yellow-400">Contact</a>
          </nav>
          <a href="/contact" className="bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded text-sm hover:bg-yellow-300 transition">
            Free Quote
          </a>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-300 py-10 px-6 mt-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-bold text-white mb-2">Kitchen 3D Ltd</p>
              <p className="text-sm">43 Manley Road, Manchester, M16 8HN</p>
              <p className="text-sm">Tel: 07882 116895</p>
              <p className="text-sm">kitchen3dltd@gmail.com</p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">Service Areas</p>
              <p className="text-sm">Manchester, Stockport, Bolton, Hyde, Bury, Salford and surrounding areas.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">Quick Links</p>
              <nav className="flex flex-col gap-1 text-sm">
                <a href="/services" className="hover:text-yellow-400">Services</a>
                <a href="/projects" className="hover:text-yellow-400">Projects</a>
                <a href="/contact" className="hover:text-yellow-400">Get a Free Quote</a>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
