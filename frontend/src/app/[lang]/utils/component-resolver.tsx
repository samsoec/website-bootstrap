import { ReactElement, lazy, createElement, Suspense } from "react";
import Loader from "../components/Loader";
import ScrollReveal from "../components/ScrollReveal";
import type { PageSection, ArticleBlock } from "@/types/generated";

type DynamicComponent = PageSection | ArticleBlock;

/**
 * Get the section ID from a component name
 * e.g., 'sections.teams' -> 'teams', 'sections.about-company' -> 'about-company'
 */
export function getSectionId(component: string): string {
  const parts = component.split(".");
  return parts[1] || parts[0];
}

export default function componentResolver(section: DynamicComponent, index: number): ReactElement {
  // Component names do look like 'category.component-name' => lowercase and kebap case
  const names: string[] = section.__component.split(".");

  // Get component name
  const component = names[1];

  // Get the section ID for anchor linking (e.g., 'teams', 'about-company')
  const sectionId = getSectionId(section.__component);

  ///////////////////////////////////////////////
  // Convert the kebap-case name to PascalCase
  const parts: string[] = component.split("-");

  let componentName = "";

  parts.forEach((s) => {
    componentName += capitalizeFirstLetter(s);
  });
  ///////////////////////////////////////////////

  //console.log(`ComponentResolver: Category => ${category} | Component => ${componentName} | Path => ../components/${componentName}`)

  // The path for dynamic imports cannot be fully dynamic.
  // Webpack requires a static part of the import path at the beginning.
  // All modules below this path will be included in the bundle and be available for dynamic loading
  // Besides, this will result in code splitting and better performance.
  // See https://webpack.js.org/api/module-methods/#import-1

  // Use react lazy loading to import the module. By convention: The file name needs to match the name of the component (what is a good idea)
  const LazyModule = lazy(() => import(`../components/${componentName}`));

  // Create react element. The 'type' argument needs to be a FunctionComponent, not a string
  const reactElement = createElement(LazyModule, { data: section, key: index });

  return (
    <section id={sectionId} key={index} className="scroll-mt-20">
      <ScrollReveal animation="fade-up" duration={800} delay={index * 50}>
        <Suspense fallback={<Loader />}>{reactElement}</Suspense>
      </ScrollReveal>
    </section>
  );
}

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
