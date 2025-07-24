import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "Record Collector",
  description: "Import, manage, and augment your data with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
