import { BlueprintTables } from "@/components/BlueprintTables";
import { AflosSimulator } from "@/components/AflosSimulator";
import { CalculatorPanel } from "@/components/CalculatorPanel";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { InfoCards } from "@/components/InfoCards";
import { ProductionPlanner } from "@/components/ProductionPlanner";
import { Section } from "@/components/Section";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TopNav } from "@/components/TopNav";

export default function Home() {
  return (
    <div className="bg-white">
      <TopNav />
      <main>
        <HeroSection />

        <Section
          id="blauwprint"
          eyebrow="1. Blauwprint 2026"
          title="Bezettingsoverzicht"
          description="De basis: hoeveel mensen per lijn en per functie in de blauwprint."
          variant="cream">
          <BlueprintTables />
        </Section>

        <Section
          id="planning"
          eyebrow="2. Planning omstandigheden"
          title="Planningsregels"
          description="De planningscondities gelden voor de inpaklijn (inpakoperator + inpakassistent). Overzicht per lijn, met extra of minder FTE."
          variant="gold">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Extra capaciteit (+ FTE)
              </p>
              <InfoCards
                gridClassName="grid gap-3 sm:gap-5 grid-cols-1"
                items={[
                  {
                    lijn: "Lijn A",
                    title: "8-stuks wafel werkopdracht",
                    subtitle: "Inpaklijn • Extra capaciteit",
                    description:
                      "Bij 8-stuks wafel werkopdrachten is 1 extra medewerker nodig op de inpaklijn. Standaard inpaklijn = 3 FTE, bij deze orders = 4 FTE.",
                    impact: "+1 FTE",
                  },
                  {
                    lijn: "Lijn E",
                    title: "Werken met tray",
                    subtitle: "Inpaklijn • Extra capaciteit",
                    description:
                      "Bij werken met tray is 1 extra medewerker nodig op de inpaklijn. Regulier = 5 FTE, met tray = 6 FTE.",
                    impact: "+1 FTE",
                  },
                ]}
              />
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Minder capaciteit (− FTE)
              </p>
              <InfoCards
                gridClassName="grid gap-3 sm:gap-5 grid-cols-1"
                items={[
                  {
                    lijn: "Lijn B",
                    title: "Mini productie",
                    subtitle: "Inpaklijn • Minder capaciteit",
                    description:
                      "Bij mini producties is de inpaklijn compacter en zijn slechts 3 medewerkers voldoende. Dit is de minimale bezetting.",
                    impact: "−3 FTE",
                  },
                ]}
              />
            </div>
          </div>
        </Section>

        <Section
          id="calculator"
          eyebrow="3. FTE Calculator"
          title="Scenario berekening"
          description="Selecteer actieve lijnen en planning condities. Direct inzicht in FTE impact per scenario."
          variant="cream">
          <CalculatorPanel />
        </Section>

        <Section
          id="planner"
          eyebrow="4. Weekplanner"
          title="Productieplanner"
          description="Plan de bezetting per dag en per shift, met ruimte voor afwijkingen en inpaklijn-condities."
          variant="cream">
          <ProductionPlanner />
        </Section>

        <Section
          id="pause-aflos"
          eyebrow="5. Pauze-aflos systeem"
          title="Aflos simulatie"
          description="Interactieve simulatie voor Lijn D & E. 3 aflos medewerkers, 4 uur aanwezig, 30 min eigen pauze."
          variant="white">
          <AflosSimulator />
        </Section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
