import { BlueprintTables } from "@/components/BlueprintTables";
import { AflosSimulator } from "@/components/AflosSimulator";
import { CalculatorPanel } from "@/components/CalculatorPanel";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { InfoCards } from "@/components/InfoCards";
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
          description="Bepaalde werkopdrachten vragen extra of minder capaciteit. Overzicht per inpaklijn."
          variant="gold">
          <InfoCards
            items={[
              {
                lijn: "Lijn A",
                title: "8-stuks wafel werkopdracht",
                subtitle: "Extra capaciteit nodig • Geen pauze-aflos",
                description:
                  "Bij 8-stuks wafel werkopdrachten is 1 extra medewerker nodig. Standaard FTE = 3, bij deze orders FTE = 4.",
                impact: "+1 FTE",
              },
              {
                lijn: "Lijn B",
                title: "Mini productie",
                subtitle: "Minder capaciteit nodig • Geen pauze-aflos",
                description:
                  "Bij mini producties is de lijn compact en zijn slechts 3 medewerkers voldoende. Dit is de minimale bezetting.",
                impact: "−3 FTE",
              },
              {
                lijn: "Lijn E",
                title: "Working with tray",
                subtitle: "Extra capaciteit nodig • Ombouw specifiek",
                description:
                  "Bij werken met tray is 1 extra medewerker nodig. Reguliere productie = 5 FTE, met tray = 6 FTE.",
                impact: "+1 FTE",
              },
            ]}
          />
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
          id="pause-aflos"
          eyebrow="4. Pauze-aflos systeem"
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
