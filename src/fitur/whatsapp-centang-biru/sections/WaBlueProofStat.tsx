const WaBlueProofStat = () => {
  return (
    <section className="border-b border-border bg-background py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div>
          <div className="mb-8 flex flex-wrap gap-6 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-black text-accent-foreground">
                S+
              </span>
              <div>
                <p className="font-semibold">4.9 ★ dari tim revenue</p>
                <p className="text-xs text-muted-foreground">Setelah profil resmi konsisten</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                CS
              </span>
              <div>
                <p className="font-semibold">4.8 ★ dari tim layanan</p>
                <p className="text-xs text-muted-foreground">Lebih sedikit eskalasi “penipuan”</p>
              </div>
            </div>
          </div>
          <h2 className="max-w-3xl text-2xl font-extrabold leading-snug text-primary md:text-3xl">
            Saat identitas jelas, pelanggan berani melangkah ke tahap berikutnya—dari sekadar baca pesan menjadi
            transaksi nyata.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Synckerja Office membantu Anda memetakan gap kepercayaan: nomor yang belum meyakinkan, konten profil yang
            belum selaras brand, hingga dokumentasi verifikasi. Targetnya sederhana: percakapan yang dianggap serius
            lebih dulu, baru optimasi kecepatan balasan.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WaBlueProofStat;
