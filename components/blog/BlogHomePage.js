import Link from "next/link";

import {
  getAllBlogArticles,
  getPublishedBlogArticles,
} from "../../lib/blog/articles";

import {
  hasBlogContent,
} from "../../lib/blog/content";

import {
  BLOG_CATEGORIES,
  getBlogArticleUrl,
  getLocalizedBlogCategory,
} from "../../lib/blog";

const COPY = {
  ar: {
    navHome: "الرئيسية",
    navJourney: "رحلة AllWDbook",
    navKdp: "مختبر KDP",
    navSeo: "SEO والنمو",
    navProduct: "بناء المنتجات",
    searchPlaceholder: "ابحث في المدونة...",
    searchLabel: "بحث",
    heroTitle: "مدونة AllWDbook",
    heroDescription:
      "محتوى عملي وصادق مبني على تجارب حقيقية في النشر الرقمي، النمو، وتحويل المشكلات إلى منتجات رقمية مفيدة.",
    categoriesTitle: "استكشف الأقسام",
    published: "منشورة",
    upcoming: "قادمة",
    explore: "استكشف القسم",
    featured: "مقالة مميزة",
    readArticle: "اقرأ المقال كاملاً",
    readingTime: "دقائق قراءة",
    latestTitle: "أحدث المقالات",
    latestDescription: "محتوى من الأقسام الأربعة الأساسية للمدونة",
    more: "عرض المزيد",
    picksTitle: "مختارات مميزة",
    newsletterTitle: "النشرة البريدية",
    newsletterText:
      "نعمل على تجهيز نشرة خفيفة لأفضل المقالات والتجارب الجديدة.",
    newsletterSoon: "قريبًا",
    tagsTitle: "الأقسام",
    quickLinksTitle: "روابط سريعة",
    about: "عن AllWDbook",
    privacy: "سياسة الخصوصية",
    backHome: "العودة للموقع",
    noPublished: "أول مقالات هذا القسم قيد الإعداد",
    planned: "قريبًا",
    searchResults: "نتائج البحث",
    searchFor: "نتائج مطابقة لـ",
    noResults: "لا توجد مقالات منشورة مطابقة حاليًا.",
    clearSearch: "مسح البحث",
    footer: "جميع الحقوق محفوظة.",
  },
  en: {
    navHome: "Home",
    navJourney: "AllWDbook Journey",
    navKdp: "KDP Lab",
    navSeo: "SEO & Growth",
    navProduct: "Product Building",
    searchPlaceholder: "Search the blog...",
    searchLabel: "Search",
    heroTitle: "AllWDbook Blog",
    heroDescription:
      "Practical, honest content built from real experiments in digital publishing, growth, and turning real problems into useful digital products.",
    categoriesTitle: "Explore the sections",
    published: "published",
    upcoming: "upcoming",
    explore: "Explore section",
    featured: "Featured article",
    readArticle: "Read full article",
    readingTime: "min read",
    latestTitle: "Latest articles",
    latestDescription: "Content from the four permanent editorial sections",
    more: "View more",
    picksTitle: "Featured picks",
    newsletterTitle: "Newsletter",
    newsletterText:
      "We are preparing a lightweight newsletter for the best new articles and experiments.",
    newsletterSoon: "Coming soon",
    tagsTitle: "Sections",
    quickLinksTitle: "Quick links",
    about: "About AllWDbook",
    privacy: "Privacy policy",
    backHome: "Back to website",
    noPublished: "The first articles in this section are being prepared",
    planned: "Coming soon",
    searchResults: "Search results",
    searchFor: "Results matching",
    noResults: "No published articles match this search yet.",
    clearSearch: "Clear search",
    footer: "All rights reserved.",
  },
};

const NAV_KEYS = {
  allwdbook: "navJourney",
  kdp: "navKdp",
  seo: "navSeo",
  creator: "navProduct",
};

function CategoryIcon({ id, className = "" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  if (id === "allwdbook") {
    return (
      <svg {...common}>
        <path d="M5 18c3-1 5-3 6-6l2-5 4-2 2 4-2 5c-1 3-3 5-6 6l-3 1 1-3-4 0Z" />
        <path d="m14 8 2 2" />
        <path d="M8 15 5 12l-2 4 2 2" />
      </svg>
    );
  }

  if (id === "kdp") {
    return (
      <svg {...common}>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" />
      </svg>
    );
  }

  if (id === "seo") {
    return (
      <svg {...common}>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="m3 8 5-4 5 4 8-6" />
        <path d="M18 2h3v3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Z" />
      <path d="m4.5 6.5 7.5 4 7.5-4" />
      <path d="M12 10.5V22" />
    </svg>
  );
}

function HeroBeacon() {
  return (
    <svg
      viewBox="0 0 560 280"
      className="blogHomeBeacon"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1d34" stopOpacity="0" />
          <stop offset="1" stopColor="#02060d" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="light" cx="0.22" cy="0.38" r="0.48">
          <stop offset="0" stopColor="#ffb15f" stopOpacity="0.95" />
          <stop offset="0.12" stopColor="#ff6900" stopOpacity="0.48" />
          <stop offset="0.55" stopColor="#ff6900" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ff6900" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="560" height="280" fill="url(#sea)" />
      <circle cx="118" cy="104" r="145" fill="url(#light)" />
      <path
        d="M0 232 56 215l42 8 42-34 54 9 50 27 57 2 54 28H0Z"
        fill="#02050a"
      />
      <path d="M102 182h32l-5-61h-22l-5 61Z" fill="#07101c" stroke="#ff8734" strokeOpacity="0.55" />
      <path d="M105 121h26l-3-15h-20l-3 15Z" fill="#0b1625" stroke="#ff8734" strokeOpacity="0.7" />
      <rect x="111" y="96" width="14" height="12" rx="2" fill="#ffd0a1" />
      <path d="M118 96V82" stroke="#ff8734" strokeWidth="3" />
      <path d="M112 82h12" stroke="#ff8734" strokeWidth="3" />
      <path d="m127 100 240-46" stroke="#ff8a36" strokeWidth="2" strokeOpacity="0.15" />
      <path d="m127 104 330 2" stroke="#ff8a36" strokeWidth="2" strokeOpacity="0.08" />
      <circle cx="422" cy="64" r="1.4" fill="#d5e3f6" opacity="0.55" />
      <circle cx="472" cy="94" r="1" fill="#d5e3f6" opacity="0.42" />
      <circle cx="382" cy="126" r="1" fill="#d5e3f6" opacity="0.4" />
    </svg>
  );
}

function FeaturedArt({ article }) {
  const isAccess =
    article?.slug ===
    "allwdbook-access-without-forced-account";

  return (
    <div
      className={`blogHomeFeaturedArt ${
        isAccess ? "isLock" : ""
      }`}
      aria-hidden="true"
    >
      {isAccess ? (
        <svg viewBox="0 0 160 160">
          <path
            d="M48 70V49c0-20 13-33 32-33s32 13 32 33v21"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <rect
            x="32"
            y="67"
            width="96"
            height="76"
            rx="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
          />
          <circle cx="80" cy="103" r="8" fill="currentColor" />
          <path d="M80 111v15" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        </svg>
      ) : (
        <CategoryIcon id={article?.category || "allwdbook"} />
      )}
    </div>
  );
}

function formatDate(date, lang) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat(
      lang === "ar" ? "ar-DZ" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    ).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
}

function matchesSearch(article, lang, query) {
  if (!query) return true;

  const text = [
    article?.[lang]?.title,
    article?.[lang]?.shortTitle,
    article?.[lang]?.description,
    article?.series,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase(lang === "ar" ? "ar" : "en");

  return text.includes(
    query.toLocaleLowerCase(lang === "ar" ? "ar" : "en"),
  );
}

function ArticleMini({ article, lang, copy, upcoming = false }) {
  const category = getLocalizedBlogCategory(
    article.category,
    lang,
  );
  const title =
    article?.[lang]?.shortTitle ||
    article?.[lang]?.title ||
    article.slug;

  const content = (
    <>
      <div
        className={`blogHomeMiniIcon category-${article.category}`}
      >
        <CategoryIcon id={article.category} />
      </div>
      <div className="blogHomeMiniText">
        <p className="blogHomeMiniCategory">
          {category?.shortName}
        </p>
        <h4>{title}</h4>
        <div className="blogHomeMiniMeta">
          {upcoming ? (
            <span className="blogHomeComingBadge">
              {copy.planned}
            </span>
          ) : (
            <>
              {article.publishDate && (
                <span>{formatDate(article.publishDate, lang)}</span>
              )}
              <span>
                {article.readingTime?.[lang]} {copy.readingTime}
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  if (upcoming) {
    return (
      <div className="blogHomeMiniArticle isUpcoming">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={getBlogArticleUrl(lang, article.slug)}
      className="blogHomeMiniArticle"
    >
      {content}
    </Link>
  );
}

export default function BlogHomePage({
  lang = "ar",
  query = "",
}) {
  const safeLang = lang === "en" ? "en" : "ar";
  const isArabic = safeLang === "ar";
  const copy = COPY[safeLang];
  const direction = isArabic ? "rtl" : "ltr";

  const publishedArticles = getPublishedBlogArticles()
    .filter((article) =>
      hasBlogContent(article.slug, safeLang),
    )
    .sort((a, b) =>
      String(b.publishDate || "").localeCompare(
        String(a.publishDate || ""),
      ),
    );

  const allArticles = getAllBlogArticles();

  const featuredArticle = publishedArticles[0] || null;
  const picks = publishedArticles.slice(0, 5);
  const searchResults = query
    ? publishedArticles.filter((article) =>
        matchesSearch(article, safeLang, query),
      )
    : [];

  const otherLang = isArabic ? "en" : "ar";
  const languageLabel = isArabic ? "English" : "العربية";

  return (
    <main
      dir={direction}
      className="blogHomePage"
    >
      <div className="blogHomeShell">
        <nav className="blogHomeNav" aria-label="Blog navigation">
          <Link href="/" className="blogHomeBrand" aria-label="AllWDbook">
            <img src="/logov3.png" alt="AllWDbook" />
          </Link>

          <div className="blogHomeNavLinks">
            <Link href={`/${safeLang}/blog`} className="isActive">
              {copy.navHome}
            </Link>
            {BLOG_CATEGORIES.map((category) => (
              <a
                href={`#blog-section-${category.id}`}
                key={category.id}
              >
                {copy[NAV_KEYS[category.id]]}
              </a>
            ))}
          </div>

          <div className="blogHomeNavActions">
            <form
              action={`/${safeLang}/blog`}
              className="blogHomeSearch"
            >
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchLabel}
              />
              <button type="submit" aria-label={copy.searchLabel}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4 4" />
                </svg>
              </button>
            </form>

            <Link
              href={`/${otherLang}/blog`}
              className="blogHomeLanguage"
            >
              {languageLabel}
            </Link>
          </div>
        </nav>

        <header className="blogHomeHero">
          <HeroBeacon />
          <div className="blogHomeHeroShade" />
          <div className="blogHomeHeroContent">
            <h1>{copy.heroTitle}</h1>
            <span className="blogHomeHeroLine" />
            <p>{copy.heroDescription}</p>
          </div>
        </header>

        <div className="blogHomeBody" dir="ltr">
          <div className="blogHomeMain" dir={direction}>
            <section
              className="blogHomeCategories"
              aria-labelledby="blog-categories-title"
            >
              <div className="blogHomeSectionHeader compact">
                <div>
                  <p className="blogHomeEyebrow">AllWDbook Editorial</p>
                  <h2 id="blog-categories-title">
                    {copy.categoriesTitle}
                  </h2>
                </div>
              </div>

              <div className="blogHomeCategoryGrid">
                {BLOG_CATEGORIES.map((category, index) => {
                  const localized = getLocalizedBlogCategory(
                    category,
                    safeLang,
                  );
                  const publishedCount = publishedArticles.filter(
                    (article) => article.category === category.id,
                  ).length;
                  const upcomingCount = allArticles.filter(
                    (article) =>
                      article.category === category.id &&
                      !article.published,
                  ).length;

                  return (
                    <a
                      id={`blog-section-${category.id}`}
                      href={`#blog-column-${category.id}`}
                      className={`blogHomeCategoryCard category-${category.id}`}
                      key={category.id}
                    >
                      <span className="blogHomeCategoryNumber">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="blogHomeCategoryIcon">
                        <CategoryIcon id={category.id} />
                      </span>
                      <h3>{localized?.name}</h3>
                      <p>{localized?.description}</p>
                      <div className="blogHomeCategoryStats">
                        <span>
                          {publishedCount} {copy.published}
                        </span>
                        {upcomingCount > 0 && (
                          <span>
                            {upcomingCount} {copy.upcoming}
                          </span>
                        )}
                      </div>
                      <strong>
                        {copy.explore}
                        <span aria-hidden="true">←</span>
                      </strong>
                    </a>
                  );
                })}
              </div>
            </section>

            {query && (
              <section className="blogHomeSearchResults">
                <div className="blogHomeSectionHeader">
                  <div>
                    <p className="blogHomeEyebrow">
                      {copy.searchResults}
                    </p>
                    <h2>
                      {copy.searchFor} “{query}”
                    </h2>
                  </div>
                  <Link
                    href={`/${safeLang}/blog`}
                    className="blogHomeTextLink"
                  >
                    {copy.clearSearch}
                  </Link>
                </div>

                {searchResults.length > 0 ? (
                  <div className="blogHomeSearchGrid">
                    {searchResults.map((article) => (
                      <ArticleMini
                        key={article.id}
                        article={article}
                        lang={safeLang}
                        copy={copy}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="blogHomeNoResults">
                    {copy.noResults}
                  </div>
                )}
              </section>
            )}

            {featuredArticle && (
              <section className="blogHomeFeatured">
                <div className="blogHomeFeaturedVisual">
                  <span className="blogHomeFeaturedBadge">
                    {copy.featured}
                  </span>
                  <FeaturedArt article={featuredArticle} />
                </div>

                <div className="blogHomeFeaturedCopy">
                  <p className="blogHomeFeaturedCategory">
                    {
                      getLocalizedBlogCategory(
                        featuredArticle.category,
                        safeLang,
                      )?.shortName
                    }
                  </p>
                  <h2>
                    {featuredArticle[safeLang]?.title}
                  </h2>
                  <p className="blogHomeFeaturedDescription">
                    {featuredArticle[safeLang]?.description}
                  </p>
                  <div className="blogHomeFeaturedMeta">
                    {featuredArticle.publishDate && (
                      <span>
                        {formatDate(
                          featuredArticle.publishDate,
                          safeLang,
                        )}
                      </span>
                    )}
                    <span>
                      {featuredArticle.readingTime?.[safeLang]} {copy.readingTime}
                    </span>
                  </div>
                  <Link
                    href={getBlogArticleUrl(
                      safeLang,
                      featuredArticle.slug,
                    )}
                    className="blogHomePrimaryButton"
                  >
                    {copy.readArticle}
                    <span aria-hidden="true">←</span>
                  </Link>
                </div>
              </section>
            )}

            <section className="blogHomeLatest">
              <div className="blogHomeSectionHeader">
                <div>
                  <p className="blogHomeEyebrow">AllWDbook Editorial</p>
                  <h2>{copy.latestTitle}</h2>
                  <p>{copy.latestDescription}</p>
                </div>
              </div>

              <div className="blogHomeColumns">
                {BLOG_CATEGORIES.map((category) => {
                  const localized = getLocalizedBlogCategory(
                    category,
                    safeLang,
                  );

                  const publishedInCategory = publishedArticles.filter(
                    (article) => article.category === category.id,
                  );

                  const upcomingInCategory = allArticles
                    .filter(
                      (article) =>
                        article.category === category.id &&
                        !article.published,
                    )
                    .slice(0, Math.max(0, 3 - publishedInCategory.length));

                  const items = [
                    ...publishedInCategory.slice(0, 3).map((article) => ({
                      article,
                      upcoming: false,
                    })),
                    ...upcomingInCategory.map((article) => ({
                      article,
                      upcoming: true,
                    })),
                  ].slice(0, 3);

                  return (
                    <article
                      className={`blogHomeCategoryColumn category-${category.id}`}
                      id={`blog-column-${category.id}`}
                      key={category.id}
                    >
                      <header>
                        <span className="blogHomeColumnIcon">
                          <CategoryIcon id={category.id} />
                        </span>
                        <div>
                          <h3>{localized?.shortName}</h3>
                          <p>{localized?.description}</p>
                        </div>
                      </header>

                      <div className="blogHomeColumnList">
                        {items.length > 0 ? (
                          items.map(({ article, upcoming }) => (
                            <ArticleMini
                              key={article.id}
                              article={article}
                              lang={safeLang}
                              copy={copy}
                              upcoming={upcoming}
                            />
                          ))
                        ) : (
                          <div className="blogHomeColumnEmpty">
                            {copy.noPublished}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="blogHomeSidebar" dir={direction}>
            <section className="blogHomeSidebarCard">
              <div className="blogHomeSidebarTitle">
                <span className="blogHomeSidebarTitleIcon">↗</span>
                <h2>{copy.picksTitle}</h2>
              </div>

              <div className="blogHomePicks">
                {picks.map((article, index) => (
                  <Link
                    href={getBlogArticleUrl(safeLang, article.slug)}
                    className="blogHomePick"
                    key={article.id}
                  >
                    <span className="blogHomePickRank">
                      {index + 1}
                    </span>
                    <div className="blogHomePickIcon">
                      <CategoryIcon id={article.category} />
                    </div>
                    <div>
                      <h3>
                        {article[safeLang]?.shortTitle ||
                          article[safeLang]?.title}
                      </h3>
                      <span>
                        {article.readingTime?.[safeLang]} {copy.readingTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="blogHomeSidebarCard blogHomeNewsletterCard">
              <div className="blogHomeNewsletterIcon">✉</div>
              <h2>{copy.newsletterTitle}</h2>
              <p>{copy.newsletterText}</p>
              <button type="button" disabled>
                {copy.newsletterSoon}
              </button>
            </section>

            <section className="blogHomeSidebarCard">
              <div className="blogHomeSidebarTitle">
                <span className="blogHomeSidebarTitleIcon">#</span>
                <h2>{copy.tagsTitle}</h2>
              </div>
              <div className="blogHomeTagCloud">
                {BLOG_CATEGORIES.map((category) => {
                  const localized = getLocalizedBlogCategory(
                    category,
                    safeLang,
                  );
                  return (
                    <a
                      href={`#blog-column-${category.id}`}
                      key={category.id}
                    >
                      {localized?.shortName}
                    </a>
                  );
                })}
              </div>
            </section>

            <section className="blogHomeSidebarCard">
              <div className="blogHomeSidebarTitle">
                <span className="blogHomeSidebarTitleIcon">☷</span>
                <h2>{copy.quickLinksTitle}</h2>
              </div>
              <div className="blogHomeQuickLinks">
                <Link href="/">{copy.backHome}</Link>
                <Link href="/about">{copy.about}</Link>
                <Link href="/privacy">{copy.privacy}</Link>
                <Link href={`/${otherLang}/blog`}>
                  {languageLabel}
                </Link>
              </div>
            </section>
          </aside>
        </div>

        <footer className="blogHomeFooter">
          <Link href="/" className="blogHomeFooterBrand">
            <img src="/logov3.png" alt="AllWDbook" />
          </Link>
          <p>
            © {new Date().getFullYear()} AllWDbook — {copy.footer}
          </p>
        </footer>
      </div>
    </main>
  );
}

