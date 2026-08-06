import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import type { ArticleContent } from "@/lib/content";
import { formatDate } from "@/lib/format-date";

export function ArticleCard({ article }: { article: ArticleContent }) {
  return (
    <Card className="flex h-full flex-col">
      <p className="text-primary text-xs font-extrabold tracking-wide uppercase">
        {article.category}
      </p>
      <h3 className="mt-3 text-xl font-bold tracking-tight">{article.title}</h3>
      <p className="text-ink-muted mt-3 flex-1 leading-7">{article.excerpt}</p>
      <p className="text-ink-muted mt-5 text-sm">
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>{" "}
        · {article.readingTime}
      </p>
      <ButtonLink
        className="mt-5 self-start"
        href={`/makaleler/${article.slug}`}
        variant="quiet"
      >
        Makaleyi oku
      </ButtonLink>
    </Card>
  );
}
