import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/layout/ParticleBackground";

export default function SiteLayout({ children }) {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 relative z-10" style={{ padding: '1.5rem clamp(1.25rem, 5vw, 8rem) 0' }}>
        {children}
      </main>
    </>
  );
}
