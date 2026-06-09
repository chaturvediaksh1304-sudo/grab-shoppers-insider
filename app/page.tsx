import { Hero } from "@/components/sections/Hero";
import { HotRightNow } from "@/components/sections/HotRightNow";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PhonePreview } from "@/components/ui/PhonePreview";

export default function Home() {
  return (
    <>
      <Hero />
      <HotRightNow />
      <HowItWorks />
      <PhonePreview />
    </>
  );
}
