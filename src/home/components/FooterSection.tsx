import logoUrl from "@/home/assets/pwa-192.png";
import { PRIVACY_POLICY_URL } from "@/home/constants/legal";

const footerColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Fitur",
    links: [
      { label: "Kehadiran", href: "#" },
      { label: "Payroll", href: "#" },
      { label: "Rekrutmen", href: "#" },
      { label: "Performance", href: "#" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Karir", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Hubungi Kami", href: "#" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Pusat Bantuan", href: "#" },
      { label: "Kebijakan Privasi", href: PRIVACY_POLICY_URL },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
];

const FooterSection = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logoUrl}
                alt=""
                width={56}
                height={56}
                className="size-14 md:size-12 shrink-0 rounded object-contain"
              />
              <div className="leading-tight">
                <p className="text-base font-semibold -mt-0.5">Synckerja Office</p>
              </div>
            </div>
            <p className="text-sm text-background/75">
              Software HR terintegrasi untuk mengelola SDM secara efisien.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold mb-3 text-sm">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-background/75 hover:text-background transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-background/20 pt-6 text-center text-xs text-background/70 space-y-2">
          <p>
            <a href={PRIVACY_POLICY_URL} className="underline hover:text-background transition-colors">
              Privacy Policy
            </a>
          </p>
          <p>© 2025 Synckerja Office. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
