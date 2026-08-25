import { getPageBySlug, getAllPages, getPostBySlug, getAllPosts, WixPage, WixPost } from "@/lib/wix";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateStaticParams() {
  const [pages, posts] = await Promise.all([getAllPages(), getAllPosts()]);
  const pageParams = pages.filter((p) => p.slug !== "home").map((p) => ({ slug: p.slug }));
  const postParams = posts.map((p) => ({ slug: p.slug }));
  return [...pageParams, ...postParams];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): ReturnType<() => Promise<Metadata>> {
  const [page, post] = await Promise.all([
    getPageBySlug(params.slug),
    getPostBySlug(params.slug),
  ]);
  const item = page || post;
  if (!item) return {};
  return {
    title: item.seoTitle || (item.title + " | Kitchen 3D Manchester"),
    description: item.metaDescription || (item.title + " - Kitchen 3D Ltd, Manchester kitchen fitters."),
  };
}

function PageContent({ page }: { page: WixPage }) {
  let body: any = null;
  if (page.bodyJson) {
    try { body = JSON.parse(page.bodyJson); } catch {}
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
        {page.heroSubtitle && (
          <p className="text-xl text-gray-600 leading-relaxed">{page.heroSubtitle}</p>
        )}
      </header>

      {body?.service_includes && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{"What's Included"}</h2>
          {Array.isArray(body.service_includes) ? (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {body.service_includes.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            Object.entries(body.service_includes).map(([section, items]) => (
              <div key={section} className="mb-6">
                <h3 className="text-lg font-semibold capitalize text-gray-800 mb-2">
                  {section.replace(/_/g, " ")}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {(items as string[]).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      )}

      {body?.faq_sections && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {body.faq_sections.map((s: string, i: number) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{s}</p>
              </div>
            ))}
          </div>
          {body.sample_questions && (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {body.sample_questions.map((q: string, i: number) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {body?.content && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-xl text-green-800 font-semibold">{body.content}</p>
        </div>
      )}

      {body?.form && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Get a Free Quote</h2>
          <p className="text-gray-700 mb-4">
            {"Fill in your details and we'll get back to you as soon as possible."}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-4">
              <strong>We collect:</strong>{" "}
              {(body.form.fields as string[]).join(", ")}
            </p>
            <a
              href="tel:07882116895"
              className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Call 07882 116895
            </a>
            <span className="mx-3 text-gray-400">or</span>
            <a
              href="https://wa.me/447882116895"
              className="inline-block bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-500 transition"
            >
              WhatsApp Us
            </a>
          </div>
        </section>
      )}

      {page.note && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800 mt-6">
          <strong>Note:</strong> {page.note}
        </div>
      )}

      {page.slug !== "thank-you" && (
        <div className="mt-12 bg-gray-900 text-white rounded-xl p-8 text-center">
          <p className="text-xl font-bold mb-4">Ready to get started?</p>
          <p className="text-gray-300 mb-6">Call 07882 116895 or get a free quote online.</p>
          <Link
            href="/contact"
            className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition inline-block"
          >
            Get a Free Quote
          </Link>
        </div>
      )}
    </article>
  );
}

function PostContent({ post, related }: { post: WixPost; related: WixPost[] }) {
  const dateStr = post.date
    ? new Date(post.date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-sm text-gray-500 mb-3">
          {dateStr} &mdash; Written by MohammadReza Savadi, Owner, Kitchen 3D
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
        <p>
          {"This article was originally published at "}
          <a
            href={post.link}
            className="text-yellow-600 underline hover:text-yellow-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            {post.link}
          </a>
          {"."}
        </p>
      </div>

      <div className="mt-12 bg-gray-900 text-white rounded-xl p-8 text-center">
        <p className="text-xl font-bold mb-4">Need a kitchen fitter in Manchester?</p>
        <p className="text-gray-300 mb-6">
          109 five-star reviews. Fully insured. Serving Greater Manchester.
        </p>
        <Link
          href="/contact"
          className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition inline-block"
        >
          Get a Free Quote
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">More from the Blog</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((rp) => (
              <Link
                key={rp.slug}
                href={"/" + rp.slug}
                className="border border-gray-200 rounded-lg p-5 hover:border-yellow-400 hover:shadow-md transition"
              >
                <p className="text-xs text-gray-500 mb-1">{rp.date}</p>
                <p className="font-semibold text-gray-900 leading-snug text-sm">{rp.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const [page, posts] = await Promise.all([
    getPageBySlug(params.slug),
    getAllPosts(),
  ]);

  if (page) {
    return <PageContent page={page} />;
  }

  const post = posts.find((p) => p.slug === params.slug) || null;
  if (post) {
    const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
    return <PostContent post={post} related={related} />;
  }

  notFound();
}
