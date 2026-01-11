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
          id="huidig"
          eyebrow="2. Huidige omstandigheden"
          title="Technische condities"
          description="De blauwprint gaat uit van optimale omstandigheden. In de praktijk vragen technische beperkingen tijdelijk extra FTE."
          variant="navy">
          <InfoCards
            items={[
              {
                lijn: "Lijn D",
                title: "Inpak — Casepacker",
                subtitle: "Niet volledig inzetbaar",
                description:
                  "Zolang de Casepacker niet bij elke werkopdracht inzetbaar is, zijn minimaal 5 medewerkers nodig. Zodra de Casepacker volledig operationeel is, kan de lijn met 4 FTE draaien.",
                impact: "+1 FTE",
              },
              {
                lijn: "Lijn D",
                title: "Baklijn — Opvoerband & Kruimelband",
                subtitle: "Twee technische issues",
                description:
                  "De opvoerband functioneert niet optimaal (+1 FTE). Daarnaast ontbreekt de kruimelband nog (+1 FTE). Samen vragen deze issues extra capaciteit.",
                impact: "+2 FTE",
              },
              {
                lijn: "Lijn E",
                title: "Baklijn — Synchronisatie",
                subtitle: "Timing probleem",
                description:
                  "Door een synchronisatieprobleem in de baklijn is tijdelijk extra ondersteuning nodig totdat dit technisch is opgelost.",
                impact: "+1 FTE",
              },
              {
                title: "Totale technische impact",
                subtitle: "Bij oplossing → structurele besparing",
                description:
                  "Als alle technische condities zijn verbeterd, kan de FTE-bezetting structureel met 4 FTE omlaag. Deze onderbouwing helpt bij investeringsbeslissingen.",
                impact: "+4 FTE totaal",
                variant: "summary",
              },
            ]}
          />
        </Section>

        <Section
          id="planning"
          eyebrow="3. Planning omstandigheden"
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
                title: "Duo order (Meli) met sealer",
                subtitle: "Extra capaciteit nodig • Geen pauze-aflos",
                description:
                  "Bij duo orders waarbij de sealer machine 2 dozen aan elkaar koppelt, zijn 8 medewerkers nodig in plaats van 7.",
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
                title: "BIO productie",
                subtitle: "Extra capaciteit nodig • Ombouw specifiek",
                description:
                  "Bij BIO producties vragen de machines die hiervoor worden ingezet 1 extra medewerker. Reguliere productie = 8 FTE, BIO = 9 FTE.",
                impact: "+1 FTE",
              },
            ]}
          />
        </Section>

        <Section
          id="calculator"
          eyebrow="4. FTE Calculator"
          title="Scenario berekening"
          description="Selecteer actieve lijnen, toggle planning condities en technische issues. Direct inzicht in FTE impact per scenario."
          variant="cream">
          <CalculatorPanel />
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
