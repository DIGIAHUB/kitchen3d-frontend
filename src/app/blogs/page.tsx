import { getAllPosts } from "@/lib/wix";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kitchen Fitting & Renovation Blog | Kitchen 3D Manchester",
  description: "Tips, guides, and insights on kitchen fitting, renovation, and installation from Kitchen 3D Ltd in Manchester.",
};

export default async function BlogsPage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Kitchen Fitting Blog</h1>
        <p className="text-xl text-gray-600">
          Tips, guides, and insights from Kitchen 3D — Manchester&apos;s trusted kitchen fitters.
        </p>
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
