import Hero from '@/components/home/Hero'
import HowItWorks from '@/components/home/HowItWorks'
import CategoryGrid from '@/components/home/CategoryGrid'
import WhyWeddify from '@/components/home/WhyWeddify'
import FeaturedVendors from '@/components/home/FeaturedVendors'
import PlanningTools from '@/components/home/PlanningTools'
import Testimonials from '@/components/home/Testimonials'
import VendorCTA from '@/components/home/VendorCTA'
import DistrictsCoverage from '@/components/home/DistrictsCoverage'
import FAQ from '@/components/home/FAQ'
import SystemStatus from '@/components/common/SystemStatus'

export default function HomePage() {
  return (
    <>
      <Hero />
      <SystemStatus />
      <HowItWorks />
      <CategoryGrid />
      <WhyWeddify />
      <FeaturedVendors />
      <PlanningTools />
      <Testimonials />
      <VendorCTA />
      <DistrictsCoverage />
      <FAQ />
    </>
  )
}
