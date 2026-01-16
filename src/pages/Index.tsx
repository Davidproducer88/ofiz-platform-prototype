import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceCategories } from "@/components/ServiceCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { FeedBanner } from "@/components/FeedBanner";
import { TopMastersRanking } from "@/components/TopMastersRanking";
import { BetaAnnouncementDialog } from "@/components/BetaAnnouncementDialog";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SEOHead } from "@/components/seo/SEOHead";
import { HOME_SEO } from "@/lib/seoData";
import { 
  generateOrganizationJsonLd, 
  generateWebSiteJsonLd, 
  OFIZ_ORGANIZATION 
} from "@/components/seo/JsonLd";

interface IndexProps {
  userType?: 'client' | 'master' | 'admin' | 'business' | null;
  onShowOnboarding?: () => void;
}

const Index = ({ userType, onShowOnboarding }: IndexProps) => {
  // JSON-LD schemas for homepage
  const homeJsonLd = [
    generateOrganizationJsonLd(OFIZ_ORGANIZATION),
    generateWebSiteJsonLd(),
  ];
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={HOME_SEO.title}
        description={HOME_SEO.description}
        canonical={HOME_SEO.canonical}
        keywords={HOME_SEO.keywords}
        jsonLd={homeJsonLd}
      />
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
