import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceCategories } from "@/components/ServiceCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

interface IndexProps {
  userType?: 'client' | 'master' | 'admin' | null;
  onShowOnboarding?: () => void;
}

const Index = ({ userType, onShowOnboarding }: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} />
      <main>
        <Hero />
        <ServiceCategories />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
