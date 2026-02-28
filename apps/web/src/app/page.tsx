import HeroSection from '@/components/candidate/home/HeroSection';
import StatsSection from '@/components/candidate/home/StatsSection';
import TopCompaniesSection from '@/components/candidate/home/TopCompaniesSection';
import JobMatchBanner from '@/components/candidate/home/JobMatchBanner';
import JobsGrid from '@/components/candidate/home/JobsGrid';
import UserReviewsSection from '@/components/candidate/home/UserReviewsSection';
import CandidateHomeNav from '@/components/candidate/home/CandidateHomeNav';
import CandidateHomeFooter from '@/components/candidate/home/CandidateHomeFooter';
import ScrollToTop from '@/components/candidate/home/ScrollToTop';
import Container from '@/components/ui/container';

export default function Home() {
  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Fixed navigation with transparent→solid scroll effect */}
      <CandidateHomeNav />

      {/* 1. Hero — search + headline (Full-width background) */}
      <HeroSection />

      {/* 2. Stats — platform numbers (Full-width background) */}
      <StatsSection />

      {/* Constrained content sections - 1200px max width */}
      <Container>
        {/* 3. Top Companies — horizontal grid */}
        <TopCompaniesSection />
      </Container>

      {/* 4. Job Match Banner — AI matching CTA (Full-width background) */}
      <JobMatchBanner />

      {/* Constrained content sections - 1200px max width */}
      <Container>
        {/* 5. Jobs Grid — category filter + job cards */}
        <JobsGrid />

        {/* 6. User Reviews — social proof */}
        <UserReviewsSection />
      </Container>

      {/* Footer */}
      <CandidateHomeFooter />

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
