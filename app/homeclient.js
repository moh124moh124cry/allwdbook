FILE: app/homeclient.js

أضف هذا الجزء بعد تعريف states مباشرة داخل HomeClient (بعد const [tab, setTab] = useState(null); أو بعد كل الـ states):

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    if (
      params.get("tool") === "keywords"
    ) {
      setTab(0);

      window.setTimeout(() => {
        document
          .getElementById(
            "awd-workspace",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    }
  }, []);

الهدف:
- الرابط /?tool=keywords يفتح الصفحة الرئيسية.
- يتم فتح Keyword Research تلقائيًا.
- يتم الانتقال مباشرة إلى مكان الأداة.
- لا يتم تغيير سلوك باقي الأدوات.

