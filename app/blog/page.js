import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function BlogPage() {
  const cookieStore = await cookies();
  const savedLang = cookieStore.get("awd_lang")?.value;

  const lang = savedLang === "en" ? "en" : "ar";

  redirect(`/${lang}/blog`);
}
