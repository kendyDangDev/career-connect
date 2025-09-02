import Link from 'next/link';
import { Briefcase, Search, MapPin, Building2, Users } from 'lucide-react';
// import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                <Briefcase className="mr-2 h-4 w-4" />
                Find your dream job today
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                Unlock your next career move with CareerConnect
              </h1>
              <p className="mb-6 text-lg text-gray-600">
                Discover thousands of job opportunities from top companies. Whether you're a
                candidate looking for your dream job or an employer searching for the perfect
                talent, CareerConnect has you covered.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-md md:flex-row md:gap-4">
                <div className="flex flex-1 items-center rounded-md border px-3 py-2">
                  <Search className="mr-2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="w-full outline-none"
                  />
                </div>
                <div className="flex items-center rounded-md border px-3 py-2">
                  <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                  <input type="text" placeholder="Location" className="w-full outline-none" />
                </div>
                {/* <Button className="w-full md:w-auto">Search Jobs</Button> */}
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">10k+</div>
                  <div className="text-sm text-gray-600">Jobs Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5k+</div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50k+</div>
                  <div className="text-sm text-gray-600">Candidates</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-purple-100 blur-3xl" />
                <div className="relative rounded-lg border bg-white p-6 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-gray-500">Featured</div>
                      <div className="font-semibold">Senior Frontend Engineer</div>
                      <div className="text-sm text-gray-500">TechCorp • Remote</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-gray-500">New</div>
                      <div className="font-semibold">Product Manager</div>
                      <div className="text-sm text-gray-500">InnovateLabs • Onsite</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-gray-500">Hot</div>
                      <div className="font-semibold">Data Scientist</div>
                      <div className="text-sm text-gray-500">DataWorks • Hybrid</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-gray-500">Trending</div>
                      <div className="font-semibold">UX Designer</div>
                      <div className="text-sm text-gray-500">DesignHub • Remote</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center">
              <Users className="mr-2 h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold">For Candidates</h3>
            </div>
            <p className="mb-4 text-gray-600">
              Create your profile, upload your resume, and get matched with top job opportunities
              tailored to your skills and experience.
            </p>
            <div className="flex gap-3">
              {/* <Button asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button> */}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center">
              <Building2 className="mr-2 h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold">For Employers</h3>
            </div>
            <p className="mb-4 text-gray-600">
              Post jobs, manage applications, and find the perfect candidates with our powerful
              hiring tools and AI-powered matching.
            </p>
            <div className="flex gap-3">
              {/* <Button asChild>
                <Link href="/post-job">Post a Job</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/candidates">Find Candidates</Link>
              </Button> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
