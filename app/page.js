import { cookies } from "next/headers";
import HomeClient from "./homeclient";

export default async function Home() {
  const cookieStore =
    await cookies();

  const languageCookie =
    cookieStore.get(
      "awd_lang",
    );

  const initialLang =
    languageCookie?.value ===
    "en"
      ? "en"
      : "ar";

  return (
    <HomeClient
      initialLang={
        initialLang
      }
      hasLanguageCookie={
        Boolean(
          languageCookie,
        )
      }
    />
  );
}

