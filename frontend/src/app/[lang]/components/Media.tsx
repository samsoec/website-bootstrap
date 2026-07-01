import { getStrapiMedia } from "../utils/api-helpers";
import Image from "next/image";
import type { MediaBlock } from "@/types/generated";

interface MediaProps {
  data: MediaBlock;
}

export default function Media({ data }: MediaProps) {
  const imgUrl = getStrapiMedia(data.file?.url ?? null);
  return (
    <div className="flex items-center justify-center mt-8 lg:mt-0 h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128">
      <Image
        src={imgUrl || ""}
        alt={data.file?.alternativeText || "none provided"}
        className="object-cover w-full h-full rounded-lg overflow-hidden"
        width={400}
        height={400}
      />
    </div>
  );
}
