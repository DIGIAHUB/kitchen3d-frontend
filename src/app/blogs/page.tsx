import { getAllPosts } from "@/lib/articles";
import type { Metadata } from "next";
import Link from "next/link";
import { isCmsSlug, isHeldArticle } from "@/lib/migration-routes";

export const metadata: Metadata = {title:"Kitchen planning guides",description:"Practical guides to kitchen installation, renovation, flooring and internal door fitting across Greater Manchester.",alternates:{canonical:"https://kitchen3d.co.uk/blogs"}};

export default async function BlogsPage() {
  const posts = (await getAllPosts()).filter(post => isCmsSlug(post.slug) && !isHeldArticle(post.slug));

  return (
    <div className="guide-index max-w-5xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Kitchen planning guides</h1>
        <p>Clear starting points for your kitchen project, from fitting to finishing details.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.slug} href={`/${post.slug}`}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-yellow-400 hover:shadow-lg transition group">
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-2">
                {post.date
                  ? new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
                  : ""}
              </p>
              <h2 className="font-bold text-gray-900 leading-snug mb-3 group-hover:text-yellow-600 transition">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
              )}
              <p className="mt-4 text-sm text-yellow-600 font-semibold">Read more &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
