import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { ProductCard, ProductZoomDialog } from "../ProductCard";
import type { Product } from "../data";
import { Container, Pill } from "../primitives";
import { KITCHEN_CATALOG_PDF, kitchenProducts } from "./data";

/**
 * "קטלוג הציפויים של סולודור למטבח": the catalogue pitch, then sample kitchen
 * coatings in a grid that runs the full width of the screen.
 * The products are placeholders until the shop database exists.
 */
export function KitchenCatalog() {
  const [zoomed, setZoomed] = useState<Product | null>(null);

  return (
    <section id="catalog" data-reveal className="scroll-mt-16 pt-14 pb-16 lg:scroll-mt-20 lg:pt-24 lg:pb-26">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="text-right">
            <Pill className="px-5 py-2 fs-16">מכניסים אתכם בדרך חדשה.</Pill>
            <h2 className="mt-4 fs-34 leading-[1.08] font-bold tracking-[-0.02em] text-balance text-foreground lg:mt-5 lg:fs-62">
              קטלוג הציפויים של סולודור למטבח
            </h2>
          </div>

          <div className="text-right">
            <h3 className="fs-24 leading-[1.2] font-bold text-foreground lg:fs-30">קטלוג ציפויי מטבחים</h3>
            <p className="mt-4 fs-20 leading-[1.6] font-medium text-pretty text-foreground lg:mt-5 lg:fs-22">
              ציפויי המטבח של סולודור הם הדרך הקלה, האסתטית והמהירה לרענן את מראה המטבח, מבלי לשבור קירות או
              להחליף ארונות.
            </p>
            <p className="mt-4 fs-18 leading-[1.85] text-pretty text-foreground">
              הקטלוג שלנו כולל מגוון עשיר של ציפויים במגוון טקסטורות, צבעים וסגנונות: מודרני, קלאסי, תעשייתי,
              נקי או צבעוני. הציפויים מותאמים אישית ומיוצרים מחומרים איכותיים ועמידים במיוחד לחום, רטיבות
              ושימוש יומיומי.
            </p>
            <p className="mt-4 fs-18 leading-[1.85] text-pretty text-foreground">
              בחרו את הסגנון שהכי מדבר אליכם, והתאימו את הציפוי לאווירה שאתם רוצים ליצור בבית. שדרוג המטבח
              שלכם מתחיל כאן.
            </p>
            <Button asChild className="mt-7 w-full px-12 lg:w-auto">
              <a href={KITCHEN_CATALOG_PDF} target="_blank" rel="noopener">
                <span>צפייה בקטלוג</span>
                <Icon name="ArrowLeft" size={16} />
              </a>
            </Button>
          </div>
        </div>
      </Container>

      {/* Edge to edge: no max width, only the page gutters. */}
      <div className="mt-10 grid grid-cols-2 gap-3 px-5 lg:mt-16 lg:grid-cols-4 lg:gap-6 lg:px-12">
        {kitchenProducts.map((product) => (
          <ProductCard key={product.name} product={product} onZoom={setZoomed} mediaClassName="h-40 lg:h-80" />
        ))}
      </div>

      <div className="mt-10 flex justify-center px-5 lg:mt-14">
        <Button asChild variant="secondary" className="w-full px-12 lg:w-auto">
          <Link to="/חנות" search={{ use: "kitchen" }}>
            <span>לכל ציפויי המטבח</span>
            <Icon name="ArrowLeft" size={16} />
          </Link>
        </Button>
      </div>

      <ProductZoomDialog product={zoomed} label="ציפוי מטבחים" onClose={() => setZoomed(null)} />
    </section>
  );
}
