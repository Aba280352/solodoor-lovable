import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Icon } from "./Icon";
import { Container, CoverImage } from "./primitives";
import { HOME_STYLES, HOME_STYLES_DEFAULTS } from "./content/home";
import { shownLabel, useSection } from "./content/sections";

type Family = (typeof HOME_STYLES_DEFAULTS)["families"][number];
import { STYLE_HUB_PATH, stylePageForName } from "./shop/styles";

function StyleCard({ family, cta }: { family: Family; cta: string }) {
  // Hovering a swatch previews it in the card image; leaving returns to the default.
  const [hovered, setHovered] = useState<number | null>(null);
  const current = family.swatches[hovered ?? 0];
  const page = stylePageForName(family.name);

  return (
    <div className="flex flex-col-reverse overflow-hidden rounded-lg border border-border bg-card transition-colors duration-240 ease-standard hover:border-foreground lg:grid lg:grid-cols-[minmax(0,1fr)_16.25rem]">
      <div className="flex flex-col items-start justify-center gap-4.5 px-5 py-6 lg:px-8 lg:py-7">
        <div className="flex flex-col gap-2">
          <span className="fs-24 leading-[1.2] font-medium text-foreground lg:fs-28">{shownLabel(family, "name")}</span>
          <span className="fs-16 leading-[1.55] text-foreground">{family.desc}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {family.swatches.map((src, i) => (
            <span
              key={i}
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
        <Link
          {...(page ? { to: "/טפט-לפי-סגנון/$style", params: { style: page.slug } } : { to: STYLE_HUB_PATH })}
          className="inline-flex items-center gap-2.5 fs-19 font-semibold text-foreground transition-[gap,color] duration-240 ease-standard hover:gap-4 hover:text-clay"
        >
          <span>{cta}</span>
          <Icon name="ArrowLeft" size={22} />
        </Link>
      </div>
      <div className="relative h-48 overflow-hidden bg-muted lg:h-65">
        {family.swatches.map((src, i) => (
          <CoverImage
            key={i}
            src={src}
            alt={shownLabel(family, "name")}
            className={cn("transition-opacity duration-420 ease-standard", src === current ? "opacity-100" : "opacity-0")}
          />
        ))}
      </div>
    </div>
  );
}

export function StyleFamilies() {
  const c = useSection(HOME_STYLES, HOME_STYLES_DEFAULTS);
  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="fs-36 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-62">
            {c.title}
          </h2>
          <p className="mt-4 fs-18 leading-[1.6] font-medium text-foreground">
            {c.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-6">
          {c.families.map((family) => (
            <StyleCard key={family.name} family={family} cta={c.cardCta} />
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:mt-14">
          <Button asChild className="w-full px-17 lg:w-auto">
            <Link to={STYLE_HUB_PATH}>
              <span>{c.cta}</span>
              <Icon name="ArrowLeft" size={16} />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
