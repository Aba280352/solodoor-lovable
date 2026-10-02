import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { ProductCard, ProductZoomDialog } from "../ProductCard";
import type { Product } from "../data";
import { Container, Pill } from "../primitives";
import { doorProducts } from "./data";

/**
 * Door coatings to buy on the site, in a grid that runs the full width of the
 * screen. The products are placeholders until the shop database exists.
 */
export function DoorsShop() {
  const [zoomed, setZoomed] = useState<Product | null>(null);

  return (
    <section id="shop" data-reveal className="scroll-mt-16 pt-14 pb-16 lg:scroll-mt-20 lg:pt-24 lg:pb-26">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Pill className="px-5 py-2 fs-16">מעדיפים לעשות את זה בעצמכם?</Pill>
          <h2 className="mt-4.5 fs-34 leading-[1.1] font-bold tracking-[-0.02em] text-foreground lg:fs-58">
            ציפויים לדלת, לקנייה באתר
          </h2>
          <p className="mt-4 max-w-[60ch] fs-18 leading-[1.7] font-medium text-foreground">
            בוחרים עיצוב, מזמינים באתר ומקבלים את הציפוי עד הבית. רוצים שנתקין בשבילכם? השאירו פרטים ונחזור אליכם.
          </p>
        </div>
      </Container>

      {/* Edge to edge: no max width, only the page gutters. */}
      <div className="mt-10 grid grid-cols-2 gap-3 px-5 lg:mt-14 lg:grid-cols-4 lg:gap-6 lg:px-12">
        {doorProducts.map((product) => (
          <ProductCard key={product.name} product={product} onZoom={setZoomed} mediaClassName="h-40 lg:h-80" />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-stretch justify-center gap-3.5 px-5 lg:mt-14 lg:flex-row lg:items-center">
        <Button asChild variant="secondary" className="px-12">
          <Link to="/חנות" search={{ cat: "door" }}>
            <span>לכל ציפויי הדלתות</span>
            <Icon name="ArrowLeft" size={16} />
          </Link>
        </Button>
        <Button asChild className="px-12">
          <a href="#quote">
            <span>קבלו הצעת מחיר להתקנה</span>
            <Icon name="ArrowLeft" size={16} />
          </a>
        </Button>
      </div>

      <ProductZoomDialog product={zoomed} label="ציפוי דלתות" onClose={() => setZoomed(null)} />
    </section>
  );
}
