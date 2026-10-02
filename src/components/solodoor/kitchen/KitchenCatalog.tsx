import { Button } from "@/components/ui/button";

import { Icon } from "../Icon";
import { ProductCard } from "../ProductCard";
import { Container } from "../primitives";
import { KITCHEN_CATALOG_PDF, kitchenProducts } from "./data";

/**
 * "קטלוג הציפויים של סולודור למטבח": the catalogue pitch, then sample kitchen
 * coatings in a grid that runs the full width of the screen.
 * The products are placeholders until the shop database exists.
 */
export function KitchenCatalog() {
  return (
    <section id="catalog" data-reveal className="scroll-mt-16 pt-14 pb-16 lg:scroll-mt-20 lg:pt-24 lg:pb-26">
      <Container>
        <div className="grid grid-cols-1 gap-8 border-t border-foreground/14 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20 lg:pt-16">
          <div className="text-right">
            <span className="inline-flex items-center gap-3 fs-16 font-medium text-clay lg:fs-18">
              <span className="block h-px w-10 bg-primary" />
              מכניסים אתכם בדרך חדשה.
            </span>
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
          <ProductCard key={product.name} product={product} mediaClassName="h-40 lg:h-80" />
        ))}
      </div>

      <div className="mt-10 flex justify-center px-5 lg:mt-14">
        <Button asChild variant="secondary" className="w-full px-12 lg:w-auto">
          <a href="#">
            <span>לכל ציפויי המטבח</span>
            <Icon name="ArrowLeft" size={16} />
          </a>
        </Button>
      </div>
    </section>
  );
}
