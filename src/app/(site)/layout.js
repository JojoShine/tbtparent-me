import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/layout/ParticleBackground";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 relative z-10" style={{ padding: '1.5rem clamp(1.25rem, 5vw, 8rem) 0' }}>
        {children}
      </main>
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </>
  );
}
