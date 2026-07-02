import type { PricingSection } from "@/types/generated";

interface PriceProps {
  data: PricingSection;
}

const PLAN_STYLES = {
  recommended: {
    card: "dark:bg-violet-600",
    priceLabel: "dark:text-gray-900",
    description: "dark:text-gray-900",
    features: "dark:text-gray-900 font-semibold",
    icon: "dark:text-gray-900",
    button: "dark:bg-gray-900 dark:text-violet-400",
  },
  default: {
    card: "dark:bg-gray-800",
    priceLabel: "dark:text-violet-500",
    description: "dark:text-gray-400",
    features: "dark:text-gray-400",
    icon: "dark:text-gray-400",
    button: "dark:bg-violet-400 dark:text-gray-900",
  },
};

export default function Pricing({ data }: PriceProps) {
  return (
    <section className="py-20 dark:bg-black dark:text-gray-100 m:py-12 lg:py-24">
      <div className="container px-4 mx-auto ">
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <span className="font-bold tracking-wider uppercase dark:text-violet-400">Pricing</span>
          <h2 className="text-4xl font-bold lg:text-5xl">{data.title}</h2>
        </div>
        <div className="flex flex-wrap items-stretch max-w-5xl mx-auto">
          {(data.plans ?? []).map((plan) => {
            const style = plan.isRecommended ? PLAN_STYLES.recommended : PLAN_STYLES.default;

            return (
              <div key={plan.id} className="w-full p-4 mb-8  sm:mx-40 lg:mx-0 lg:w-1/3 lg:mb-0">
                <div
                  className={`flex flex-col p-6 space-y-6 rounded shadow sm:p-8 min-h-118.75 min-w-75 ${style.card}`}
                >
                  <div className="space-y-2">
                    <h4 className="text-3xl font-bold mb-6">{plan.name}</h4>
                    <span className="text-6xl font-bold ">
                      {plan.price}
                      <span className={`ml-1 text-sm tracking-wid ${style.priceLabel}`}>
                        {plan.pricePeriod?.toLowerCase()}
                      </span>
                    </span>
                  </div>
                  <p className={`mt-3 leading-relaxed text-lg font-bold ${style.description}`}>
                    {plan.description}
                  </p>
                  <ul className={`flex-1 mb-6 ${style.features}`}>
                    {(plan.product_features ?? []).map((feature) => (
                      <li key={feature.id} className="flex mb-2 space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`shrink-0 w-6 h-6 ${style.icon}`}
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`inline-block px-5 py-3 font-semibold tracking-wider text-center rounded   ${style.button}`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
