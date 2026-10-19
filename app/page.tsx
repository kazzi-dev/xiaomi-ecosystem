import SmoothScroll from '@/components/ui/SmoothScroll';
import Preloader from '@/components/ui/Preloader';
import Navbar from '@/components/ui/Navbar';
import SectionDots from '@/components/ui/SectionDots';
import Cursor from '@/components/ui/Cursor';
import Grain from '@/components/ui/Grain';
import MadeBy from '@/components/ui/MadeBy';
import Hero from '@/components/sections/Hero';
import Pro from '@/components/sections/Pro';
import Fold from '@/components/sections/Fold';
import Pad from '@/components/sections/Pad';
import PadDetails from '@/components/sections/PadDetails';
import Ecosystem from '@/components/sections/Ecosystem';
import Compare from '@/components/sections/Compare';
import Configurator from '@/components/sections/Configurator';
import Footer from '@/components/sections/Footer';

export default function Page() {
  return (
    <SmoothScroll>
      <Preloader />
      <Navbar />
      <SectionDots />
      <Cursor />
      <Grain />
      <MadeBy />
      <main>
        <Hero />
        <Pro />
        <Fold />
        <Pad />
        <PadDetails />
        <Ecosystem />
        <Compare />
        <Configurator />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
