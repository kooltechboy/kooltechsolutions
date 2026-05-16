import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import PricingSection from "@/components/sections/PricingSection";
import BlogSection from "@/components/sections/BlogSection";
import CTASection from "@/components/sections/CTASection";
import TrustBar from "@/components/sections/TrustBar";
import WhyUsSection from "@/components/sections/WhyUsSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <ServicesSection />
        <WhyUsSection />
        <PricingSection />
        <BlogSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
