import { Button } from "@/components/ui/button";

import { Icon } from "./Icon";
import { Container, CoverImage } from "./primitives";
import { articles } from "./data";

export function Articles() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">מדריכים ומאמרים</h2>
          <span className="mt-5 block h-0.5 w-14 bg-primary" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-13 lg:grid-cols-3 lg:gap-6">
          {articles.map((post) => (
            <div
              key={post.title}
              className="flex flex-col overflow-hidden rounded-[0.5rem] border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground"
            >
              <div className="relative h-55 overflow-hidden bg-muted">
                <CoverImage src={post.img} alt={post.title} />
              </div>
              <div className="flex flex-auto flex-col gap-3 px-5 pt-6 pb-6.5 text-right lg:px-6.5">
                <span className="fs-18 leading-[1.4] font-semibold text-foreground">{post.title}</span>
                <span className="flex-auto fs-16 leading-[1.75] text-foreground">{post.excerpt}</span>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 fs-16 font-medium text-clay transition-[gap,color] duration-240 ease-standard hover:gap-3.5 hover:text-foreground"
                >
                  <span>קרא עוד</span>
                  <Icon name="AngleLeft" size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:mt-13">
          <Button asChild className="w-full px-17 py-4.5 lg:w-auto">
            <a href="#">
              <span>לכל המאמרים</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
