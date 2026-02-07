"use client";

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
import { useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const { getText, t } = useLanguage();

  return (
    <div className="bg-white">
      <TopNav />
      <main>
        <HeroSection />

        <Section
          id="blauwprint"
          eyebrow={getText(t.sections.blauwprint.eyebrow)}
          title={getText(t.sections.blauwprint.title)}
          description={getText(t.sections.blauwprint.description)}
          variant="cream">
          <BlueprintTables />
        </Section>

        <Section
          id="planning"
          eyebrow={getText(t.sections.planning.eyebrow)}
          title={getText(t.sections.planning.title)}
          description={getText(t.sections.planning.description)}
          variant="gold">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                {getText(t.planningRules.extraCapacity)}
              </p>
              <InfoCards
                gridClassName="grid gap-3 sm:gap-5 grid-cols-1"
                items={[
                  {
                    lijn: `${getText(t.common.line)} A`,
                    title: getText(t.planningRules.lijnA8stuks.title),
                    subtitle: getText(t.planningRules.lijnA8stuks.subtitle),
                    description: getText(
                      t.planningRules.lijnA8stuks.description,
                    ),
                    impact: "+1 FTE",
                  },
                  {
                    lijn: `${getText(t.common.line)} E`,
                    title: getText(t.planningRules.lijnETray.title),
                    subtitle: getText(t.planningRules.lijnETray.subtitle),
                    description: getText(t.planningRules.lijnETray.description),
                    impact: "+1 FTE",
                  },
                ]}
              />
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
                {getText(t.planningRules.lessCapacity)}
              </p>
              <InfoCards
                gridClassName="grid gap-3 sm:gap-5 grid-cols-1"
                items={[
                  {
                    lijn: `${getText(t.common.line)} B`,
                    title: getText(t.planningRules.lijnBMini.title),
                    subtitle: getText(t.planningRules.lijnBMini.subtitle),
                    description: getText(t.planningRules.lijnBMini.description),
                    impact: "−3 FTE",
                  },
                ]}
              />
            </div>
          </div>
        </Section>

        <Section
          id="calculator"
          eyebrow={getText(t.sections.calculator.eyebrow)}
          title={getText(t.sections.calculator.title)}
          description={getText(t.sections.calculator.description)}
          variant="cream">
          <CalculatorPanel />
        </Section>

        <Section
          id="planner"
          eyebrow={getText(t.sections.planner.eyebrow)}
          title={getText(t.sections.planner.title)}
          description={getText(t.sections.planner.description)}
          variant="cream">
          <ProductionPlanner />
        </Section>

        <Section
          id="pause-aflos"
          eyebrow={getText(t.sections.pauseAflos.eyebrow)}
          title={getText(t.sections.pauseAflos.title)}
          description={getText(t.sections.pauseAflos.description)}
          variant="white">
          <AflosSimulator />
        </Section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
