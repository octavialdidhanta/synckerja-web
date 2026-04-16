import logoUrl from "@/home/assets/pwa-192.png";

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
                <p className="text-base font-bold -mt-0.5">Synckerja Office</p>
              </div>
            </div>
            <p className="text-sm text-background/60">
              Software HR terintegrasi untuk mengelola SDM secara efisien.
            </p>
          </div>
          {[
            { title: "Fitur", links: ["Kehadiran", "Payroll", "Rekrutmen", "Performance"] },
            { title: "Perusahaan", links: ["Tentang Kami", "Karir", "Blog", "Hubungi Kami"] },
            { title: "Dukungan", links: ["Pusat Bantuan", "Kebijakan Privasi", "Syarat & Ketentuan"] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold mb-3 text-sm">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          © 2025 Synckerja Office. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
