import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceCategories } from "@/components/ServiceCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { FeedBanner } from "@/components/FeedBanner";
import { TopMastersRanking } from "@/components/TopMastersRanking";
import { BetaAnnouncementDialog } from "@/components/BetaAnnouncementDialog";

import { ScrollToTop } from "@/components/ScrollToTop";

interface IndexProps {
  userType?: 'client' | 'master' | 'admin' | 'business' | null;
  onShowOnboarding?: () => void;
}

const Index = ({ userType, onShowOnboarding }: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      <BetaAnnouncementDialog />
      <Header userType={userType} />
      <main>
        <Hero />
        <ServiceCategories />
        
        <FeedBanner />
        <div className="container mx-auto px-4 py-8">
          <TopMastersRanking />
        </div>
        <HowItWorks />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
