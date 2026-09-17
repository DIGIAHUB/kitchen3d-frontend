import { PreviewHome } from "@/components/preview/home";

export default function HomePage() {
  return <PreviewHome preview={process.env.K3D_LOCAL_PREVIEW === "1"} />;
}
