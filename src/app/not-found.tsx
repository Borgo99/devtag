import { Background } from "@/components/profile/Background";
import { Lost } from "@/components/profile/Lost";
import { sample } from "@/components/landing/sample";

export default function NotFound() {
  return (
    <>
      <Background config={sample} />
      <Lost />
    </>
  );
}
