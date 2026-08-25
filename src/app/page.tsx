import { getPageBySlug, getAllPosts } from "@/lib/wix";
import Link from "next/link";

export default async function HomePage() {
  const [page, posts] = await Promise.all([
    getPageBySlug("home"),
    getAllPosts(),
  ]);

  const services = [
    { title: "Kitchen Fitting & Installation", slug: "kitchen-fitting-installation" },
    { title: "Worktop Installation", slug: "worktop-installation" },
    { title: "Sink & Hob Fitting", slug: "sink-hob-fitting" },
    { title: "Door Fitting", slug: "door-fitting" },
    { title: "Flooring Installation", slug: "flooring-installation" },
    { title: "Bedroom Furniture Installation & Assembly", slug: "bedroom-furniture-installation-assembly" },
    { title: "Wall & Floor Tiling", slug: "wall-floor-tiling" },
    { title: "Plumbing Works", slug: "plumbing-works" },
    { title: "Electrical Works", slug: "electrical-works" },
  ];

  return (
    <div>
      <section className="bg-gray-900 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {page?.title || "Kitchen Fitters Manchester"}
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Manchester&apos;s trusted kitchen fitters. 109 five-star reviews. Supply &amp; install or installation only.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition">
            Get a Free Quote
          </Link>
          <a href="tel:07882116895" className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-gray-900 transition">
            Call 07882 116895
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-400">Serving Manchester, Stockport, Bolton, Hyde, Bury &amp; surrounding areas.</p>
      </section>

      <section className="bg-yellow-400 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-gray-900 font-semibold text-sm">
          <span>★ 109 Google Reviews</span>
          <span>★ Checkatrade Rated</span>
          <span>★ MyBuilder Rated</span>
          <span>Fully Insured</span>
          <span>Trade Accounts: Wren, Howdens, B&amp;Q, Magnet</span>
        </div>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Our Services</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}
              className="border border-gray-200 rounded-lg p-6 hover:border-yellow-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">{s.title}</p>
              <p className="text-sm text-yellow-600 mt-2">Learn more &rarr;</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-10">Latest from the Blog</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/${post.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-yellow-400 hover:shadow-md transition">
                <p className="text-xs text-gray-500 mb-2">{post.date}</p>
                <p className="font-semibold text-gray-900 leading-snug">{post.title}</p>
                {post.excerpt && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/blogs" className="text-yellow-600 font-semibold hover:underline">View all posts &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Get a free, no-obligation quote. We cover Manchester, Stockport, Bolton, Hyde, Bury and surrounding areas.
        </p>
        <Link href="/contact" className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition inline-block">
          Get a Free Quote
        </Link>
      </section>
    </div>
  );
}
