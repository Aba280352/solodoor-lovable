import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "./Icon";
import { ProductCard, ProductZoomDialog } from "./ProductCard";
import { Container, Pill } from "./primitives";
import type { Product } from "./data";
import { bestSellerTabs } from "./shop/featured";
import { useShop } from "./shop/useShop";
import { useQuiz } from "./quiz-context";
import { HOME_BEST_SELLERS, HOME_BEST_SELLERS_DEFAULTS } from "./content/home";
import { useSection } from "./content/sections";
import { EF } from "./content/layout";

export function BestSellers() {
  const { shop } = useShop();
  const bestSellers = useMemo(() => (shop ? bestSellerTabs(shop) : []), [shop]);
  const [tab, setTab] = useState<string>();
  const [zoomed, setZoomed] = useState<Product | null>(null);
  const { openQuiz } = useQuiz();
  const c = useSection(HOME_BEST_SELLERS, HOME_BEST_SELLERS_DEFAULTS);
  const active = bestSellers.find((group) => group.tab === tab) ?? bestSellers[0];
  if (!active) return null;

  return (
    <section data-reveal className="pt-14 pb-16 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="px-5.5 py-[0.5625rem] tracking-[0.14em] whitespace-nowrap"><EF f="pill">{c.pill}</EF></Pill>
          <h2 className="mt-5.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            <EF f="title">{c.title}</EF>
          </h2>
          <p className="mt-4 max-w-[70ch] fs-18 leading-[1.7] font-medium text-foreground">
            <EF f="text">{c.text}</EF>
          </p>
        </div>

        <div className="scrollbar-none -mx-5 mt-8 flex flex-nowrap gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:mt-11 lg:justify-center lg:overflow-visible lg:px-0">
          {bestSellers.map((group) => (
            <button
              key={group.tab}
              type="button"
              onClick={() => setTab(group.tab)}
              className="relative flex-none cursor-pointer rounded-full border border-border bg-card px-4.5 py-3 fs-16 font-medium whitespace-nowrap text-foreground transition-colors duration-240 ease-standard hover:border-secondary"
            >
              {group.tab === active.tab && <span className="absolute -inset-px rounded-full bg-primary" />}
              <span className="relative">{group.tab}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          {active.items.map((product) => (
            <ProductCard key={product.name} product={product} onZoom={setZoomed} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3.5 lg:mt-13 lg:flex-row lg:items-center">
          <Button asChild variant="secondary" className="py-4.5">
            <Link to="/חנות">
              <span><EF f="shopCta">{c.shopCta}</EF></span>
              <Icon name="ArrowLeft" size={16} />
            </Link>
          </Button>
          <Button asChild className="px-5 py-4.5 whitespace-normal lg:px-10 lg:whitespace-nowrap">
            <a href="#" onClick={openQuiz}>
              <span><EF f="quizCta">{c.quizCta}</EF></span>
              <Icon name="ArrowLeft" size={16} />
            </a>
          </Button>
        </div>
      </Container>

      <ProductZoomDialog product={zoomed} label={active.tab} onClose={() => setZoomed(null)} />
    </section>
  );
}
