import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/layout/ParticleBackground";
import Footer from "@/components/layout/Footer";
import CatDuty from "@/components/ui/CatDuty";

export default function GameLayout({ children }) {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="site-main game-main flex-1 relative z-10">
        {children}
      </main>
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
      <CatDuty />
    </>
  );
}
