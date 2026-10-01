import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Container, CoverImage } from "./primitives";
import { styleFamilies } from "./data";

function StyleCard({ family }: { family: (typeof styleFamilies)[number] }) {
  // Hovering a swatch previews it in the card image; leaving returns to the default.
  const [hovered, setHovered] = useState<number | null>(null);
  const current = family.swatches[hovered ?? 0];

  return (
    <div className="flex flex-col-reverse overflow-hidden rounded-lg border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground lg:grid lg:grid-cols-[minmax(0,1fr)_16.25rem]">
      <div className="flex flex-col items-start justify-center gap-4.5 px-5 py-6 lg:px-8 lg:py-7">
        <div className="flex flex-col gap-2">
          <span className="fs-24 leading-[1.2] font-medium text-foreground lg:fs-28">{family.name}</span>
          <span className="fs-16 leading-[1.55] text-foreground">{family.desc}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {family.swatches.map((src, i) => (
            <span
              key={src}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "block size-9 flex-none cursor-pointer overflow-hidden rounded-full border border-border transition-shadow duration-160 ease-standard",
                hovered === i && "shadow-swatch",
              )}
            >
              <img src={src} alt="" className="block size-full object-cover" />
            </span>
          ))}
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2.5 fs-19 font-semibold text-foreground transition-[gap,color] duration-240 ease-standard hover:gap-4 hover:text-clay"
        >
          <span>לצפייה בדגמים</span>
          <Icon name="ArrowLeft" size={22} />
        </a>
      </div>
      <div className="relative h-48 overflow-hidden bg-muted lg:h-65">
        {family.swatches.map((src) => (
          <CoverImage
            key={src}
            src={src}
            alt={family.name}
            className={cn("transition-opacity duration-420 ease-standard", src === current ? "opacity-100" : "opacity-0")}
          />
        ))}
      </div>
    </div>
  );
}

export function StyleFamilies() {
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="fs-36 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-62">
            בחרו את הסגנון שמתאים לכם
          </h2>
          <p className="mt-4 fs-18 leading-[1.6] font-medium text-foreground">
            מגוון רחב של טקסטורות, צבעים ודוגמאות לעיצוב בכל חלל בבית.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-6">
          {styleFamilies.map((family) => (
            <StyleCard key={family.name} family={family} />
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:mt-14">
          <Button asChild className="w-full px-17 lg:w-auto">
            <a href="#">
              <span>לכל הדגמים</span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
