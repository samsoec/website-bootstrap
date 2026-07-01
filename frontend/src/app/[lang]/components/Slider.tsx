"use client";
import { Fade } from "react-slideshow-image";
import { getStrapiMedia } from "../utils/api-helpers";
import Image from "next/image";
import type { SliderBlock } from "@/types/generated";

interface SlideShowProps {
  data: SliderBlock;
}

export default function Slideshow({ data }: SlideShowProps) {
  return (
    <div className="slide-container">
      <Fade>
        {(data.files ?? []).map((fadeImage, index) => {
          const imageUrl = getStrapiMedia(fadeImage.url);
          return (
            <div key={index}>
              {imageUrl && (
                <Image
                  className="w-full h-96 object-cover rounded-lg"
                  height={400}
                  width={600}
                  alt={fadeImage.alternativeText || "slider image"}
                  src={imageUrl}
                />
              )}
            </div>
          );
        })}
      </Fade>
    </div>
  );
}
