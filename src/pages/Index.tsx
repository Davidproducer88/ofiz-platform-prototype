import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceCategories } from "@/components/ServiceCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { FeedBanner } from "@/components/FeedBanner";

interface IndexProps {
  userType?: 'client' | 'master' | 'admin' | 'business' | null;
  onShowOnboarding?: () => void;
}

const Index = ({ userType, onShowOnboarding }: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} />
      <main>
        <Hero />
        <ServiceCategories />
        <FeedBanner />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
