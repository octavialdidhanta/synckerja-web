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
            Kalau identitas jelas, pelanggan lebih berani lanjut dari baca pesan sampai transaksi.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Synckerja Office bantu bereskan hal yang bikin pelanggan ragu: nomor kurang meyakinkan, profil belum selaras
            brand, sampai syarat verifikasi yang belum lengkap. Kepercayaan dulu baru tim bisa fokus menjual dan melayani.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WaBlueProofStat;
