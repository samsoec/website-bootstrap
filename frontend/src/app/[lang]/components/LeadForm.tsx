import FormSubmit from "./FormSubmit";
import type { LeadFormSection } from "@/types/generated";

interface LeadFormProps {
  data: LeadFormSection;
}

export default function Email({ data }: LeadFormProps) {
  return (
    <section className="py-6 dark:bg-black dark:text-gray-50">
      <div className="container mx-auto flex flex-col justify-center p-4 space-y-8 md:p-10 lg:space-y-0 lg:space-x-12 lg:justify-between lg:flex-row">
        <div className="flex flex-col space-y-4 text-center lg:text-left">
          <h1 className="text-5xl font-bold leading-none">{data.title}</h1>
          <p className="text-lg">{data.description}</p>
        </div>
        <FormSubmit placeholder={data.emailPlaceholder ?? ""} text={data.submitButton?.text ?? ""} />
      </div>
    </section>
  );
}
