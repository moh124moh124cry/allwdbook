import "./globals.css";

export const metadata = {
    title: "AllWDbook™ — Amazon KDP Publisher Tools | All World Digital",
      description: "Keyword research, micro-niche generation, competitor tracking and category discovery for Amazon KDP publishers. Designed by All World Digital.",
        authors: [{ name: "All World Digital" }],
          applicationName: "AllWDbook",
            icons: { icon: "/logo.png", apple: "/logo.png" }
};

export default function RootLayout({ children }) {
    return (
          <html lang="ar" dir="rtl">
                <body>{children}</body>
                    </html>
    );
  }
  
    )
}
}
                      