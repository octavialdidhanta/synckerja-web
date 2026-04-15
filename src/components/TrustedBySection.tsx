const companies = [
  "Mitsubishi Corporation", "PFI Mega Life", "BNI Asset Management",
  "Core99", "Orient Jakarta", "midPlaza Holding",
];

const TrustedBySection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-foreground mb-8">
          Dipercaya 35.000+ bisnis di Asia Tenggara
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
          {companies.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">{name}</span>
              <span className="text-xs px-3 py-1 bg-foreground text-background rounded font-medium">Studi kasus</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
