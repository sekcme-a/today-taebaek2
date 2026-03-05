import Footer from "./components/Footer";
import Header from "./components/Header";

export default function CompanyLayout({ children }) {
  return (
    <div className="bg-white">
      <Header />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  );
}
