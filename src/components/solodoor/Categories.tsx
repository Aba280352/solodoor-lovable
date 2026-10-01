import { Icon } from "./Icon";
import { Container, CoverImage } from "./primitives";
import { categories } from "./data";

const rows = [categories.slice(0, 4), categories.slice(4)];

export function Categories() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <span className="block h-0.5 w-14 bg-primary" />
          <h2 className="mt-6.5 fs-36 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-62">
            הקטגוריות שלנו
          </h2>
          <p className="mt-3.5 fs-18 font-medium text-foreground">פתרונות עיצוב מדביקים לכל חלל בבית</p>
        </div>

        <div className="mt-10 flex flex-col gap-3 lg:mt-14 lg:gap-6">
          {rows.map((row, r) => (
            <div key={r} className="grid grid-cols-2 gap-3 lg:flex lg:items-stretch lg:gap-6">
              {row.map((cat) => (
                // On desktop the hovered card widens (flex-grow 1 -> 1.4) and shows its alternate look.
                <a
                  key={cat.name}
                  href="#"
                  className="group block min-w-0 overflow-hidden rounded-lg border border-border bg-card [transition:border-color_240ms_var(--ease-standard),flex-grow_1500ms_var(--ease-grow)] hover:border-secondary lg:flex-[1_1_0] lg:hover:grow-[1.4]"
                >
                  <div className="relative h-36 overflow-hidden bg-muted lg:h-58">
                    <CoverImage src={cat.img} alt={cat.name} className="transition-opacity duration-700 ease-standard group-hover:opacity-0" />
                    <CoverImage src={cat.variant} alt={cat.name} className="opacity-0 transition-opacity duration-700 ease-standard group-hover:opacity-100" />
                  </div>
                  <div className="flex items-center justify-between gap-1.5 bg-card px-2.5 py-3 text-foreground transition-colors duration-420 ease-standard group-hover:bg-secondary group-hover:text-secondary-foreground lg:gap-4 lg:px-5 lg:py-4.5">
                    <span className="min-w-0 text-[clamp(0.6875rem,3.4vw,0.9375rem)] font-medium whitespace-nowrap lg:fs-18">
                      {cat.name}
                    </span>
                    <span className="inline-flex size-6 flex-none items-center justify-center rounded-full border border-primary text-primary transition-[background-color,color,transform,border-color] duration-420 ease-standard group-hover:-translate-x-1.5 group-hover:border-background group-hover:bg-background group-hover:text-secondary lg:size-8 lg:[&_svg]:size-[0.9375rem]!">
                      <Icon name="ArrowLeft" size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
