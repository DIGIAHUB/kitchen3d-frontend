import type { WixPage, WixPost } from "@/lib/wix";
import { getPageBySlug, getAllPages } from "@/lib/service-pages";
import { getPostBySlug, getAllPosts } from "@/lib/articles";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { cmsMetadata, isCmsSlug, isHeldArticle, isHeldPage, migrationParams } from "@/lib/migration-routes";
import { parseArticleBody } from "@/lib/article-body";
import { parsePageBody } from "@/lib/page-body";
import { releaseIndexingEnabled } from "@/lib/release-metadata";

export async function generateStaticParams() {
  const [pages, posts] = await Promise.all([getAllPages(), getAllPosts()]);
  return migrationParams(pages, posts);
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  if (!isCmsSlug(params.slug) || isHeldArticle(params.slug) || isHeldPage(params.slug)) return { robots: { index: false, follow: false } };
  const [page, post] = await Promise.all([
    getPageBySlug(params.slug),
    getPostBySlug(params.slug),
  ]);
  const item = page || post;
  if (!item) return {};
  if (page && post) throw new Error("Conflicting CMS migration slug");
  return {
    ...cmsMetadata(item),
    robots: { index: releaseIndexingEnabled(), follow: releaseIndexingEnabled() },
  };
}

function PageContent({ page }: { page: WixPage }) {
  const body = parsePageBody(page.bodyJson);

  return (
    <article className="content-article max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
        {page.heroSubtitle && (
          <p className="text-xl text-gray-600 leading-relaxed">{page.heroSubtitle}</p>
        )}
      </header>

      {body?.service_includes && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Planning the work</h2>
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
                  {items.map((item: string, i: number) => (
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

      <div className="article-next-step">
          <h2>{page.slug === "thank-you" ? "Need to contact us?" : "Discuss your project"}</h2>
          <p>Online enquiries and bookings are not yet available. Call Reza on <a href="tel:07882116895">07882 116 895</a> or <a href="mailto:kitchen3dltd@gmail.com">email Kitchen3D</a>.</p>
          {page.slug === "thank-you" && <p>This page does not confirm that an enquiry was received or an appointment booked.</p>}
          <Link
            href="/#your-kitchen"
            className="button button-dark"
          >
            Choose your next step
          </Link>
        </div>
    </article>
  );
}

function PostContent({ post, related }: { post: WixPost; related: WixPost[] }) {
  const blocks = parseArticleBody(post.bodyJson);
  const dateStr = post.date
    ? new Date(post.date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="content-article max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-sm text-gray-500 mb-3">
          {dateStr}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      <div className="article-body">
        {blocks ? blocks.map((block, index) => {
          if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
          if (block.type === "list-item") return <ul key={index}><li>{block.text}</li></ul>;
          return <p key={index}>{block.text}</p>;
        }) : <p>This article is being prepared for the new website. Please contact Reza if you have a question about your project.</p>}
      </div>

      <div className="article-next-step">
        <h2>Discuss your kitchen project</h2>
        <Link
          href="/#your-kitchen"
          className="button button-dark"
        >
          Choose your next step
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

export default async function SlugPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  if (!isCmsSlug(params.slug) || isHeldArticle(params.slug) || isHeldPage(params.slug)) notFound();
  const [page, posts] = await Promise.all([
    getPageBySlug(params.slug),
    getAllPosts(),
  ]);

  if (page && posts.some((post) => post.slug === params.slug)) {
    throw new Error("Conflicting CMS migration slug");
  }
  if (page) {
    return <PageContent page={page} />;
  }

  const post = posts.find((p) => p.slug === params.slug) || null;
  if (post) {
    const related = posts.filter((p) => p.slug !== post.slug && isCmsSlug(p.slug) && !isHeldArticle(p.slug)).slice(0, 3);
    return <PostContent post={post} related={related} />;
  }

  notFound();
}
