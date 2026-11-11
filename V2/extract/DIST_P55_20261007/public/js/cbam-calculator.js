(function () {
  "use strict";

  /* CBAM cost estimator. The only fixed figures are the EU CBAM factors: the share of EU free allocation
     still given each year, set by Directive 2003/87/EC Article 10a(1a) as amended by Directive (EU) 2023/959;
     from 2034 no factor applies. Everything else is a visitor input.
     emissions = tonnes x emissions per tonne
     adjustment = tonnes x benchmark per tonne x CBAM factor of the year; benchmark left empty = emissions per tonne
     deduction = emissions x carbon price paid / certificate price, needs a certificate price when a price was paid
     certificates = emissions - adjustment - deduction, never below 0; cost = certificates x certificate price.
     The deduction shown is the part that counts: never more than the emissions left after the adjustment.
     Sectors, Regulation (EU) 2023/956: Annex I goods and gases; Annex II = goods with direct emissions only;
     electricity in MWh with no free allocation adjustment, as EU electricity producers buy all their allowances.
     Goods: the EU default values for goods from Morocco, official EU file of default values, version of 2026-08-06,
     Implementing Regulation 2026/1740; picking a good fills the emissions per tonne, a typed value replaces it.
     No network call, text only, no markup injected. */

  var CBAM_FACTOR = {
    2026: 0.975, 2027: 0.95, 2028: 0.90, 2029: 0.775, 2030: 0.515,
    2031: 0.39, 2032: 0.265, 2033: 0.14, 2034: 0
  };
  var YEARS = Object.keys(CBAM_FACTOR).map(Number);

  /* unit, scope of emissions and gases per sector: Annex I gases, Annex II direct-only goods, Article 7.
     threshold = the 50-tonne hint is shown; hydrogen and electricity show a plain volume hint instead */
  var SECTORS = {
    "cement": { unit: "t", direct: false, freeAllocation: true, threshold: true,
      hint: "Counts direct and indirect emissions. Gas: carbon dioxide." },
    "electricity": { unit: "MWh", direct: true, freeAllocation: false, threshold: false,
      hint: "Counted in megawatt hours. Gas: carbon dioxide." },
    "fertilisers": { unit: "t", direct: false, freeAllocation: true, threshold: true,
      hint: "Counts direct and indirect emissions. Gases: carbon dioxide, and nitrous oxide for some goods." },
    "iron-steel": { unit: "t", direct: true, freeAllocation: true, threshold: true,
      hint: "Counts direct emissions for most goods. Gas: carbon dioxide." },
    "aluminium": { unit: "t", direct: true, freeAllocation: true, threshold: true,
      hint: "Counts direct emissions. Gases: carbon dioxide and perfluorocarbons." },
    "hydrogen": { unit: "t", direct: true, freeAllocation: true, threshold: false,
      hint: "Counts direct emissions. Gas: carbon dioxide." }
  };

  /* EU default values, tCO2e per tonne of good, from the official EU file of default values, version of 2026-08-06,
     Implementing Regulation 2026/1740. Row = CN code, the file's description shortened at a clause, value, origin, scope.
     Origin "m" = the Morocco table; "o" = the table for other countries and territories, for codes Morocco lists
     with no value or does not list. Scope "d" = direct emissions, Annex II goods, the file's direct column;
     "t" = direct and indirect, the file's total column. Electricity: the file holds no value, so no row. */
  var GOODS = {
    "cement": [
      ["2507 00 80 80", "Calcined clay", 0.28, "o", "t"],
      ["2523 10 00 10", "White clinker", 1.37, "o", "t"],
      ["2523 10 00 90", "Other clinker including grey clinker", 0.9, "m", "t"],
      ["2523 21 00", "White Portland cement", 1.36, "m", "t"],
      ["2523 29 00", "Grey Portland cement", 0.95, "m", "t"],
      ["2523 30 00", "Aluminous cement", 2.03, "o", "t"],
      ["2523 90 00 10", "White hydraulic cement", 1.45, "m", "t"],
      ["2523 90 00 90", "Other hydraulic cements including grey hydraulic cements", 0.91, "m", "t"]
    ],
    "fertilisers": [
      ["2808 00 00", "Nitric acid; sulphonitric acids", 2.54, "m", "t"],
      ["2814 10 00", "Anhydrous ammonia", 2.2, "m", "t"],
      ["2814 20 00", "Ammonia in aqueous solution", 0.66, "m", "t"],
      ["2834 21 00", "Nitrate of potassium", 2.1, "m", "t"],
      ["3102 10 12", "Urea in aqueous solution", 0.5, "m", "t"],
      ["3102 10 15", "Urea in aqueous solution", 0.79, "m", "t"],
      ["3102 10 19", "Urea, whether or not in aqueous solution", 1.5, "m", "t"],
      ["3102 10 90", "Urea, whether or not in aqueous solution", 1.46, "m", "t"],
      ["3102 21 00", "Ammonium sulphate", 0.7, "m", "t"],
      ["3102 29 00", "Double salts and mixtures of ammonium sulphate and ammonium nitrate", 1.42, "m", "t"],
      ["3102 30 10", "Ammonium nitrate in aqueous solution", 1.62, "m", "t"],
      ["3102 30 90", "Ammonium nitrate", 2.49, "m", "t"],
      ["3102 40 10", "Mixtures of ammonium nitrate", 2.14, "m", "t"],
      ["3102 40 90", "Mixtures of ammonium nitrate", 2.14, "m", "t"],
      ["3102 50 00", "Sodium nitrate", 3.97, "m", "t"],
      ["3102 60 00", "Double salts and mixtures of calcium nitrate and ammonium nitrate", 2.09, "m", "t"],
      ["3102 80 00", "Mixtures of urea and ammonium nitrate in aqueous or ammoniacal solution", 1.59, "m", "t"],
      ["3102 90 00", "Mineral or chemical nitrogen fertilisers", 1.65, "m", "t"],
      ["3105 10 00", "Mineral or chemical fertilisers of animal or vegetable origin", 0.86, "m", "t"],
      ["3105 20 10", "Mineral or chemical fertilisers", 1.12, "m", "t"],
      ["3105 20 90", "Mineral or chemical fertilisers containing nitrogen", 0.77, "m", "t"],
      ["3105 30 00", "Diammonium hydrogenorthophosphate", 0.55, "m", "t"],
      ["3105 40 00", "Ammonium dihydrogenorthophosphate", 0.37, "m", "t"],
      ["3105 51 00", "Other mineral or chemical fertilisers", 1.52, "m", "t"],
      ["3105 59 00", "Other mineral or chemical fertilisers", 0.67, "m", "t"],
      ["3105 90 20", "Mineral or chemical fertilisers", 1.42, "m", "t"],
      ["3105 90 80", "Mineral or chemical fertilisers", 0.75, "m", "t"]
    ],
    "iron-steel": [
      ["2601 12 00", "Agglomerated iron ores and concentrates", 0.686, "o", "t"],
      ["7201", "Pig iron and spiegeleisen, in pigs", 3.48, "o", "d"],
      ["7202 11", "Ferro-manganese, containing by weight > 2% of carbon", 1.69, "o", "d"],
      ["7202 19", "Ferro-manganese, containing by weight <= 2% carbon", 5.59, "o", "d"],
      ["7202 41", "Ferro-chromium, containing by weight > 4% of carbon", 2.35, "o", "d"],
      ["7202 49", "Ferro-chromium, containing by weight <= 4% of carbon", 2.87, "o", "d"],
      ["7202 60 00", "Ferro-nickel", 4.014, "o", "d"],
      ["7203", "Ferrous products obtained by direct reduction of iron ore and other spongy ferrous products", 1.325, "o", "d"],
      ["7205", "Granules and powders of pig iron, spiegeleisen", 3.715, "o", "d"],
      ["7206 10 00", "Ingots, of iron and non-alloy steel", 3.75, "o", "d"],
      ["7206 90 00", "Iron and non-alloy steel", 3.75, "o", "d"],
      ["7207 11 11", "Semi-finished products, of non-alloy free-cutting steel", 3.996, "o", "d"],
      ["7207 11 14", "Semi-finished products, of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 11 16", "Semi-finished products, of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 11 90", "Semi-finished products of iron or non-alloy steel", 4.053, "o", "d"],
      ["7207 12 10", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 12 90", "Semi-finished products of iron or non-alloy steel", 4.053, "o", "d"],
      ["7207 19 12", "Semi-finished products, of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 19 19", "Semi-finished products of iron or non-alloy steel", 4.053, "o", "d"],
      ["7207 19 80", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 20 11", "Semi-finished products, of non-alloy free-cutting steel", 3.996, "o", "d"],
      ["7207 20 15", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 20 17", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 20 19", "Semi-finished products of iron or non-alloy steel", 4.053, "o", "d"],
      ["7207 20 32", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 20 39", "Semi-finished products of iron or non-alloy steel", 4.053, "o", "d"],
      ["7207 20 52", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7207 20 59", "Semi-finished products of iron or non-alloy steel", 4.053, "o", "d"],
      ["7207 20 80", "Semi-finished products of iron or non-alloy steel", 3.996, "o", "d"],
      ["7208", "Flat-rolled products of iron or non-alloy steel", 4.049, "o", "d"],
      ["7209", "Flat-rolled products of iron or non-alloy steel", 4.101, "o", "d"],
      ["7210", "Flat-rolled products of iron or non-alloy steel", 4.101, "o", "d"],
      ["7211 13 00", "Flat-rolled products of iron or non-alloy steel", 4.049, "o", "d"],
      ["7211 14 00", "Flat-rolled products of iron or non-alloy steel", 4.049, "o", "d"],
      ["7211 19 00", "Flat-rolled products of iron or non-alloy steel", 4.049, "o", "d"],
      ["7211 23", "Flat-rolled products of iron or non-alloy steel", 4.101, "o", "d"],
      ["7211 29 00", "Flat-rolled products of iron or non-alloy steel", 4.101, "o", "d"],
      ["7211 90", "Flat-rolled products of iron or non-alloy steel", 4.101, "o", "d"],
      ["7212", "Flat-rolled products of iron or non-alloy steel", 4.101, "o", "d"],
      ["7213", "Bars and rods of iron or non-alloy steel, hot-rolled", 3.996, "o", "d"],
      ["7214 10 00", "Bars and rods, of iron or non-alloy steel", 4.053, "o", "d"],
      ["7214 20 00", "Bars and rods, of iron or non-alloy steel", 3.996, "o", "d"],
      ["7214 30 00", "Bars and rods, of non-alloy free-cutting steel", 3.996, "o", "d"],
      ["7214 91", "Bars and rods, of iron or non-alloy steel", 3.996, "o", "d"],
      ["7214 99", "Bars and rods, of iron or non-alloy steel, only hot-rolled", 3.996, "o", "d"],
      ["7215", "Bars and rods, of iron or non-alloy steel", 3.996, "o", "d"],
      ["7216", "Angles, shapes and sections of iron or non-alloy steel", 3.996, "o", "d"],
      ["7217 10", "Wire of iron or non-alloy steel, in coils", 3.996, "o", "d"],
      ["7217 20", "Wire of iron or non-alloy steel, in coils", 3.996, "o", "d"],
      ["7217 30", "Wire of iron or non-alloy steel, in coils", 3.996, "o", "d"],
      ["7217 90", "Wire of iron or non-alloy steel, in coils, plated or coated", 3.996, "o", "d"],
      ["7218 10 00", "Steel, stainless, in ingots and other primary forms", 5.006, "o", "d"],
      ["7218 91", "Semi-finished products of stainless steel", 4.94, "o", "d"],
      ["7218 99 11", "Semi-finished products of stainless steel", 4.94, "o", "d"],
      ["7218 99 19", "Semi-finished products of stainless steel", 5.006, "o", "d"],
      ["7218 99 20", "Semi-finished products of stainless steel", 4.94, "o", "d"],
      ["7218 99 80", "Semi-finished products of stainless steel, forged", 5.006, "o", "d"],
      ["7219 11 00", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 12", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 13", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 14", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 21", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 22", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 23 00", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 24 00", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7219 31 00", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7219 32", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7219 33", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7219 34", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7219 35", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7219 90", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7220 11 00", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7220 12 00", "Flat-rolled products of stainless steel", 4.94, "o", "d"],
      ["7220 20", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7220 90", "Flat-rolled products of stainless steel", 5.02, "o", "d"],
      ["7221", "Bars and rods of stainless steel, hot-rolled", 4.82, "o", "d"],
      ["7222 11", "Bars and rods of stainless steel, only hot-rolled", 4.82, "o", "d"],
      ["7222 19", "Bars and rods of stainless steel, only hot-rolled", 4.82, "o", "d"],
      ["7222 20", "Other bars and rods of stainless steel", 4.82, "o", "d"],
      ["7222 30", "Other bars and rods of stainless steel", 5.006, "o", "d"],
      ["7222 40", "Angles, shapes and sections of stainless steel, n.e.s.", 4.82, "o", "d"],
      ["7223 00", "Wire of stainless steel, in coils", 4.82, "o", "d"],
      ["7224 10", "Steel, alloy, other than stainless", 5.589, "o", "d"],
      ["7224 90 02", "Semi-finished products of tool steel", 5.5, "o", "d"],
      ["7224 90 03", "Semi-finished products of high-speed steel", 5.5, "o", "d"],
      ["7224 90 05", "Semi-finished products of steel", 5.5, "o", "d"],
      ["7224 90 07", "Semi-finished products of alloy steel other than stainless steel", 5.5, "o", "d"],
      ["7224 90 14", "Semi-finished products of alloy steel other than stainless steel", 5.5, "o", "d"],
      ["7224 90 18", "Semi-finished products of alloy steel other than stainless steel", 5.589, "o", "d"],
      ["7224 90 31", "Semi-finished products of steel", 5.5, "o", "d"],
      ["7224 90 38", "Semi-finished products of alloy steel", 5.5, "o", "d"],
      ["7224 90 90", "Semi-finished products of alloy steel", 5.589, "o", "d"],
      ["7225 11 00", "Flat-rolled products of silicon-electrical steel", 7.1, "o", "d"],
      ["7225 19 10", "Flat-rolled products of silicon-electrical steel", 5.5, "o", "d"],
      ["7225 19 90", "Flat-rolled products of silicon-electrical steel", 5.588, "o", "d"],
      ["7225 30", "Flat-rolled products of alloy steel other than stainless", 5.5, "o", "d"],
      ["7225 40", "Flat-rolled products of alloy steel other than stainless", 5.5, "o", "d"],
      ["7225 50", "Flat-rolled products of alloy steel other than stainless", 5.588, "o", "d"],
      ["7225 91 00", "Flat-rolled products of alloy steel other than stainless", 5.588, "o", "d"],
      ["7225 92 00", "Flat-rolled products of alloy steel other than stainless", 5.588, "o", "d"],
      ["7225 99 00", "Flat-rolled products of alloy steel other than stainless", 5.588, "o", "d"],
      ["7226 11 00", "Flat-rolled products of silicon-electrical steel", 7.1, "o", "d"],
      ["7226 19 10", "Flat-rolled products of silicon-electrical steel", 5.5, "o", "d"],
      ["7226 19 80", "Flat-rolled products of silicon-electrical steel", 5.588, "o", "d"],
      ["7226 20 00", "Flat-rolled products of high-speed steel", 5.5, "o", "d"],
      ["7226 91", "Flat-rolled products of alloy steel other than stainless", 5.5, "o", "d"],
      ["7226 92 00", "Flat-rolled products of alloy steel other than stainless", 5.59, "o", "d"],
      ["7226 99", "Flat-rolled products of alloy steel other than stainless", 5.588, "o", "d"],
      ["7227", "Bars and rods of alloy steel other than stainless", 5.4, "o", "d"],
      ["7228 10 20", "Bars and rods of high-speed steel", 5.4, "o", "d"],
      ["7228 10 50", "Bars and rods of high-speed steel, forged", 5.589, "o", "d"],
      ["7228 10 90", "Bars and rods of high-speed steel", 5.4, "o", "d"],
      ["7228 20", "Bars and rods of silico-manganese steel", 5.4, "o", "d"],
      ["7228 30", "Bars and rods of alloy steel other than stainless", 5.4, "o", "d"],
      ["7228 40", "Bars and rods of alloy steel other than stainless", 5.589, "o", "d"],
      ["7228 50", "Bars and rods of alloy steel other than stainless", 5.4, "o", "d"],
      ["7228 60", "Bars and rods of alloy steel other than stainless", 5.4, "o", "d"],
      ["7228 70", "Angles, shapes and sections of alloy steel other than stainless", 5.4, "o", "d"],
      ["7228 80 00", "Hollow drill bars and rods, of alloy or non-alloy steel", 5.4, "o", "d"],
      ["7229", "Wire of alloy steel other than stainless, in coils", 5.4, "o", "d"],
      ["7301", "Sheet piling of iron or steel, whether or not drilled", 4.063, "o", "d"],
      ["7302", "Railway or tramway track construction material of iron or steel", 4.887, "o", "d"],
      ["7303 00", "Tubes, pipes and hollow profiles, of cast iron", 4.15, "o", "d"],
      ["7304 11 00", "Line pipe of a kind used for oil or gas pipelines, seamless", 5.184, "o", "d"],
      ["7304 19", "Line pipe of a kind used for oil or gas pipelines, seamless", 3.981, "o", "d"],
      ["7304 22 00", "Drill pipe, seamless, of stainless steel", 5.184, "o", "d"],
      ["7304 23 00", "Drill pipe, seamless", 3.981, "o", "d"],
      ["7304 24 00", "Casing and tubing, seamless", 5.184, "o", "d"],
      ["7304 29", "Casing and tubing, seamless, of iron or steel", 3.981, "o", "d"],
      ["7304 31", "Tubes, pipes and hollow profiles, seamless", 3.981, "o", "d"],
      ["7304 39", "Tubes, pipes and hollow profiles, seamless", 3.981, "o", "d"],
      ["7304 41 00", "Tubes, pipes and hollow profiles, seamless", 5.184, "o", "d"],
      ["7304 49", "Tubes, pipes and hollow profiles, seamless", 5.184, "o", "d"],
      ["7304 51", "Tubes, pipes and hollow profiles, seamless", 3.878, "o", "d"],
      ["7304 59", "Tubes, pipes and hollow profiles, seamless", 3.878, "o", "d"],
      ["7304 90 00", "Tubes, pipes and hollow profiles, seamless", 3.981, "o", "d"],
      ["7305", "Tubes and pipes", 4.06, "o", "d"],
      ["7306 11 00", "Line pipe of a kind used for oil or gas pipelines, welded", 5.369, "o", "d"],
      ["7306 19 00", "Line pipe of a kind used for oil or gas pipelines, welded", 4.141, "o", "d"],
      ["7306 21 00", "Casing and tubing of a kind used in drilling for oil or gas", 5.369, "o", "d"],
      ["7306 29 00", "Casing and tubing of a kind used in drilling for oil or gas", 4.141, "o", "d"],
      ["7306 30 12", "Precision tubes, welded, of circular cross-section", 4.141, "o", "d"],
      ["7306 30 18", "Precision tubes, welded, of circular cross-section", 4.09, "o", "d"],
      ["7306 30 41", "Threaded or threadable tubes, welded", 4.141, "o", "d"],
      ["7306 30 49", "Threaded or threadable tubes, welded", 4.141, "o", "d"],
      ["7306 30 72", "Other tubes, pipes and hollow profiles, welded", 4.141, "o", "d"],
      ["7306 30 77", "Other tubes, pipes and hollow profiles, welded", 4.141, "o", "d"],
      ["7306 30 80", "Tubes, pipes and hollow profiles, welded", 4.141, "o", "d"],
      ["7306 40 20", "Tubes, pipes and hollow profiles, welded", 5.369, "o", "d"],
      ["7306 40 80", "Tubes, pipes and hollow profiles, welded", 5.296, "o", "d"],
      ["7306 50 21", "Precision steel tubes, welded, of circular cross-section", 4.128, "o", "d"],
      ["7306 50 29", "Precision steel tubes, welded, of circular cross-section", 4.056, "o", "d"],
      ["7306 50 80", "Tubes, pipes and hollow profiles, welded", 4.128, "o", "d"],
      ["7306 61 10", "Tubes and pipes and hollow profiles, welded", 5.369, "o", "d"],
      ["7306 61 92", "Tubes and pipes and hollow profiles, welded", 4.141, "o", "d"],
      ["7306 61 99", "Tubes and pipes and hollow profiles, welded", 4.141, "o", "d"],
      ["7306 69 10", "Tubes, pipes and hollow profiles, welded", 5.369, "o", "d"],
      ["7306 69 90", "Tubes, pipes and hollow profiles, welded", 4.141, "o", "d"],
      ["7306 90 00", "Tubes, pipes and hollow profiles, of iron or steel", 4.141, "o", "d"],
      ["7307 11", "Tube or pipe fittings of non-malleable cast iron", 3.929, "o", "d"],
      ["7307 19 10", "Tube or pipe fittings of cast iron", 3.929, "o", "d"],
      ["7307 19 90", "Cast tube or pipe fittings of steel", 4.053, "o", "d"],
      ["7307 21 00", "Flanges of stainless steel", 4.498, "o", "d"],
      ["7307 22", "Threaded elbows, bends and sleeves of stainless steel", 4.498, "o", "d"],
      ["7307 23", "Butt welding tube or pipe fittings of stainless steel", 4.498, "o", "d"],
      ["7307 29", "Tube or pipe fittings of stainless steel", 4.498, "o", "d"],
      ["7307 91 00", "Flanges of iron or steel", 4.072, "o", "d"],
      ["7307 92", "Threaded elbows, bends and sleeves, of stainless steel", 4.072, "o", "d"],
      ["7307 93", "Butt welding fittings of iron or steel", 4.072, "o", "d"],
      ["7307 99", "Tube or pipe fittings, of iron or steel", 4.072, "o", "d"],
      ["7308", "Structures and parts of structures, of iron or steel", 5.064, "o", "d"],
      ["7309", "Reservoirs, tanks, vats and similar containers", 5.468, "o", "d"],
      ["7310", "Tanks, casks, drums, cans, boxes and similar containers", 4.228, "o", "d"],
      ["7311 00", "Containers of iron or steel, for compressed or liquefied gas", 5.385, "o", "d"],
      ["7318 11 00", "Coach screws of iron or steel", 3.962, "o", "d"],
      ["7318 12 10", "Wood screws of stainless steel", 5.119, "o", "d"],
      ["7318 12 90", "Wood screws of iron or steel other than stainless", 3.962, "o", "d"],
      ["7318 13 00", "Screw hooks and screw rings, of iron or steel", 3.962, "o", "d"],
      ["7318 14 10", "Self-tapping screws, of stainless steel", 5.119, "o", "d"],
      ["7318 14 91", "Spaced-thread screws of iron or steel other than stainless", 3.962, "o", "d"],
      ["7318 14 99", "Self-tapping screws of iron or steel other than stainless", 3.962, "o", "d"],
      ["7318 15", "Threaded screws and bolts, of iron or steel", 4.801, "o", "d"],
      ["7318 16", "Nuts of iron or steel", 4.693, "o", "d"],
      ["7318 19 00", "Threaded articles, of iron or steel, n.e.s.", 3.962, "o", "d"],
      ["7318 21 00", "Spring washers and other lock washers, of iron or steel", 3.962, "o", "d"],
      ["7318 22 00", "Washers of iron or steel", 4.322, "o", "d"],
      ["7318 23 00", "Rivets of iron or steel", 3.963, "o", "d"],
      ["7318 24 00", "Cotters and cotter pins, of iron or steel", 3.962, "o", "d"],
      ["7318 29 00", "Non-threaded articles, of iron or steel", 3.962, "o", "d"],
      ["7326 11 00", "Grinding balls and similar articles for mills", 4.08, "o", "d"],
      ["7326 19", "Articles of iron or steel, forged or stamped", 4.08, "o", "d"],
      ["7326 20 00", "Articles of iron or steel wire, n.e.s.", 4.051, "o", "d"],
      ["7326 90 30", "Ladders and steps, of iron or steel", 4.051, "o", "d"],
      ["7326 90 40", "Pallets and similar platforms for handling goods", 4.051, "o", "d"],
      ["7326 90 50", "Reels for cables, piping and the like, of iron or steel", 4.051, "o", "d"],
      ["7326 90 60", "Ventilators, non-mechanical, guttering", 4.051, "o", "d"],
      ["7326 90 92", "Articles of iron or steel, open-die forged, n.e.s.", 4.08, "o", "d"],
      ["7326 90 94", "Articles of iron or steel, closed-die forged, n.e.s.", 4.08, "o", "d"],
      ["7326 90 96", "Sintered articles of iron or steel, n.e.s.", 4.08, "o", "d"],
      ["7326 90 98", "Articles of iron or steel, n.e.s.", 4.151, "o", "d"]
    ],
    "aluminium": [
      ["7601", "Unwrought aluminium", 0.36, "m", "d"],
      ["7603", "Aluminium powders and flakes", 0.51, "m", "d"],
      ["7604 10 10", "Bars and rods", 0.73, "m", "d"],
      ["7604 10 90", "Profiles", 0.75, "m", "d"],
      ["7604 21 00", "Hollow profiles", 0.75, "m", "d"],
      ["7604 29 10", "Bars and rods", 0.73, "m", "d"],
      ["7604 29 90", "Profiles", 0.75, "m", "d"],
      ["7605", "Aluminium wire", 0.73, "m", "d"],
      ["7606", "Aluminium plates, sheets and strip", 1.19, "m", "d"],
      ["7607", "Aluminium foil of a thickness not exceeding 0,2 mm", 1.19, "m", "d"],
      ["7608", "Aluminium tubes and pipes", 0.75, "m", "d"],
      ["7609 00 00", "Aluminium tube or pipe fittings", 0.75, "m", "d"],
      ["7610 10 00", "Doors, windows and their frames and thresholds for doors", 0.75, "m", "d"],
      ["7610 90", "Other", 0.75, "m", "d"],
      ["7610 90 10", "Bridges and bridge-sections, towers and lattice masts", 0.75, "m", "d"],
      ["7610 90 90", "Other", 0.75, "m", "d"],
      ["7611 00 00", "Aluminium reservoirs, tanks, vats and similar containers", 1.19, "m", "d"],
      ["7612", "Aluminium casks, drums, cans, boxes and similar containers", 1.19, "m", "d"],
      ["7613 00 00", "Aluminium containers for compressed or liquefied gas", 1.19, "m", "d"],
      ["7614", "Stranded wire, cables, plaited bands and the like", 0.73, "m", "d"],
      ["7616 10 00", "Nails, tacks, staples, screws, bolts, nuts, screw hooks", 1.19, "m", "d"],
      ["7616 91 00", "Cloth, grill, netting and fencing, of aluminium wire", 1.19, "m", "d"],
      ["7616 99 10", "Cast", 0.51, "m", "d"],
      ["7616 99 90", "Other", 1.19, "m", "d"]
    ],
    "hydrogen": [
      ["2804 10 00", "Hydrogen", 10.82, "m", "d"]
    ]
  };

  /* the CN heading = the first four digits; the goods list has one option group per heading */
  function heading(code) {
    return code.slice(0, 4);
  }

  function findGood(sector, code) {
    var rows = GOODS[sector] || [];
    for (var i = 0; i < rows.length; i += 1) {
      if (rows[i][0] === code) {
        return rows[i];
      }
    }
    return null;
  }

  /* clears binary floating-point noise before a result is shown or tested */
  function clean(number) {
    return Math.round(number * 1e6) / 1e6;
  }

  /* input: tonnes, intensity, benchmark (null = intensity), year, paid, price (null = none entered).
     deduction and certificates are null when a price was paid but no certificate price is entered. */
  function compute(input) {
    var benchmark = input.benchmark === null ? input.intensity : input.benchmark;
    var emissions = clean(input.tonnes * input.intensity);
    var adjustment = clean(input.tonnes * benchmark * CBAM_FACTOR[input.year]);
    var deduction;
    if (input.paid === 0) {
      deduction = 0;
    } else if (input.price === null || input.price === 0) {
      deduction = null;
    } else {
      deduction = clean(emissions * input.paid / input.price);
    }
    var certificates = deduction === null ? null : clean(Math.max(0, emissions - adjustment - deduction));
    var deductionApplied = deduction === null ? null : clean(Math.min(deduction, Math.max(0, emissions - adjustment)));
    var cost = certificates === null || input.price === null ? null : clean(certificates * input.price);
    var perTonne = cost === null || input.tonnes === 0 ? null : clean(cost / input.tonnes);
    return {
      emissions: emissions, adjustment: adjustment, deduction: deduction, deductionApplied: deductionApplied,
      certificates: certificates, cost: cost, perTonne: perTonne
    };
  }

  function readNumber(field, min, max, optional) {
    var raw = field.value.trim();
    if (raw === "") {
      return optional ? { value: null } : { error: "Enter a number." };
    }
    var number = Number(raw);
    if (!isFinite(number)) {
      return { error: "Enter a number." };
    }
    if (number < min) {
      return { error: "Enter " + min + " or more." };
    }
    if (max !== null && number > max) {
      return { error: "Enter " + max + " or less." };
    }
    return { value: number };
  }

  var api = { compute: compute, CBAM_FACTOR: CBAM_FACTOR, YEARS: YEARS, SECTORS: SECTORS, GOODS: GOODS, findGood: findGood, heading: heading };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof document === "undefined") {
    return;
  }

  var form = document.getElementById("cb-form");
  var body = document.getElementById("cb-years-body");
  if (!form || !body) {
    return;
  }

  var fields = {
    tonnes: { min: 0, max: null, optional: false },
    intensity: { min: 0, max: null, optional: false },
    benchmark: { min: 0, max: null, optional: true },
    paid: { min: 0, max: null, optional: false },
    price: { min: 0, max: null, optional: true }
  };

  function format(number) {
    var digits = Math.abs(number) < 10 ? 2 : 0;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(number);
  }

  /* shares keep one decimal, so 22.5 % shows as the law writes it */
  function formatShare(number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(clean(number));
  }

  /* a message, not a number, is set in the body face */
  function show(id, text, isMessage) {
    var cell = document.getElementById(id);
    cell.textContent = text;
    cell.classList.toggle("is-prompt", Boolean(isMessage));
  }

  /* one table row per year, built once; cells are filled on every update */
  var rows = {};
  YEARS.forEach(function (year) {
    var row = document.createElement("tr");
    var head = document.createElement("th");
    head.scope = "row";
    head.textContent = year === 2034 ? "2034 onward" : String(year);
    row.appendChild(head);
    rows[year] = [document.createElement("td"), document.createElement("td"), document.createElement("td")];
    rows[year].forEach(function (cell) {
      row.appendChild(cell);
    });
    body.appendChild(row);
  });

  var sectorSelect = document.getElementById("cb-sector");
  var goodsSelect = document.getElementById("cb-goods");
  var goodsHint = document.getElementById("cb-goods-hint");
  var intensityField = document.getElementById("cb-intensity");
  var benchmarkField = document.getElementById("cb-benchmark");
  var TEXT = {
    sectorHint: "Each sector sets the unit, the gases and the emissions counted.",
    tonnesT: "Goods exported to the EU per year, tonnes",
    tonnesMWh: "Electricity exported to the EU per year, MWh",
    tonnesHintT: "EU importers above 50 tonnes of CBAM goods need the status of authorised CBAM declarant.",
    tonnesHintMWh: "Enter the yearly volume in megawatt hours.",
    tonnesHintPlain: "Enter the yearly volume in tonnes.",
    intensityAny: "Embedded emissions, tCO2e per tonne of goods",
    intensityDirect: "Direct embedded emissions, tCO2e per tonne of goods",
    intensityBoth: "Direct and indirect embedded emissions, tCO2e per tonne of goods",
    intensityMWh: "Embedded emissions, tCO2e per MWh",
    intensityHintT: "From verified installation data, or the EU default value for the product.",
    intensityHintMWh: "From the EU default value for the country of production, or actual data where the EU criteria are met.",
    benchmarkT: "EU free allocation benchmark, tCO2e per tonne of goods",
    benchmarkMWh: "EU free allocation benchmark, tCO2e per MWh",
    benchmarkHintT: "Optional. EU benchmarks are set in Implementing Regulation 2025/2620. Left empty, the estimate takes the benchmark as equal to your emissions per tonne; a lower EU benchmark raises the cost.",
    benchmarkHintMWh: "EU electricity producers buy all their allowances, so no free allocation adjustment applies.",
    perUnitT: "Indicative cost per tonne of goods",
    perUnitMWh: "Indicative cost per MWh",
    goodsNone: "Choose a sector to list its goods.",
    goodsOwn: "Pick a good to fill its EU default value, or enter your own value below.",
    goodsMWh: "Enter the emissions per MWh below.",
    presetMorocco: "EU default value for goods from Morocco, Implementing Regulation 2026/1740. The EU adds a mark-up to default values.",
    presetOther: "EU default value for other countries and territories, Implementing Regulation 2026/1740. The EU adds a mark-up to default values."
  };

  function setText(id, text) {
    document.getElementById(id).textContent = text;
  }

  /* the chosen sector sets the unit, the labels and whether a free allocation adjustment applies */
  function applySector() {
    var sector = SECTORS[sectorSelect.value];
    var mwh = Boolean(sector) && sector.unit === "MWh";
    setText("cb-sector-hint", sector ? sector.hint : TEXT.sectorHint);
    setText("cb-tonnes-label", mwh ? TEXT.tonnesMWh : TEXT.tonnesT);
    setText("cb-tonnes-hint", mwh ? TEXT.tonnesHintMWh : sector && !sector.threshold ? TEXT.tonnesHintPlain : TEXT.tonnesHintT);
    setText("cb-intensity-label", !sector ? TEXT.intensityAny : mwh ? TEXT.intensityMWh : sector.direct ? TEXT.intensityDirect : TEXT.intensityBoth);
    setText("cb-intensity-hint", mwh ? TEXT.intensityHintMWh : TEXT.intensityHintT);
    setText("cb-benchmark-label", mwh ? TEXT.benchmarkMWh : TEXT.benchmarkT);
    setText("cb-benchmark-hint", mwh ? TEXT.benchmarkHintMWh : TEXT.benchmarkHintT);
    setText("cb-per-unit-label", mwh ? TEXT.perUnitMWh : TEXT.perUnitT);
    var noAllocation = Boolean(sector) && !sector.freeAllocation;
    if (noAllocation) {
      benchmarkField.value = "";
    }
    /* read-only, not disabled: the field stays in the tab order and its hint gives the reason */
    benchmarkField.readOnly = noAllocation;
    if (noAllocation) {
      benchmarkField.setAttribute("aria-disabled", "true");
    } else {
      benchmarkField.removeAttribute("aria-disabled");
    }
    benchmarkField.placeholder = noAllocation ? "None for electricity" : "Same as your emissions";
  }

  /* fills the goods list of the chosen sector, one option group per CN heading; keeps the same good when listed */
  function fillGoods() {
    var keep = goodsSelect.value;
    while (goodsSelect.options.length > 1) {
      goodsSelect.remove(1);
    }
    while (goodsSelect.querySelector("optgroup")) {
      goodsSelect.removeChild(goodsSelect.querySelector("optgroup"));
    }
    var group = null;
    (GOODS[sectorSelect.value] || []).forEach(function (row) {
      if (!group || group.getAttribute("data-heading") !== heading(row[0])) {
        group = document.createElement("optgroup");
        group.label = "CN " + heading(row[0]);
        group.setAttribute("data-heading", heading(row[0]));
        goodsSelect.appendChild(group);
      }
      var option = document.createElement("option");
      option.value = row[0];
      option.textContent = row[0] + " " + row[1];
      group.appendChild(option);
    });
    goodsSelect.value = findGood(sectorSelect.value, keep) ? keep : "";
    /* no list for electricity or before a sector: the select stays reachable and its hint gives the reason */
    if (goodsSelect.options.length > 1) {
      goodsSelect.removeAttribute("aria-disabled");
    } else {
      goodsSelect.setAttribute("aria-disabled", "true");
    }
  }

  /* a good picked fills the emissions per tonne with its EU default value and names the source */
  function applyGood() {
    var sector = SECTORS[sectorSelect.value];
    var row = findGood(sectorSelect.value, goodsSelect.value);
    if (row) {
      intensityField.value = String(row[2]);
      goodsHint.textContent = row[3] === "m" ? TEXT.presetMorocco : TEXT.presetOther;
      setText("cb-intensity-label", row[4] === "d" ? TEXT.intensityDirect : TEXT.intensityBoth);
    } else {
      goodsHint.textContent = !sector ? TEXT.goodsNone : sector.unit === "MWh" ? TEXT.goodsMWh : TEXT.goodsOwn;
    }
  }


  /* "Email this estimate": a mailto link carrying the visible inputs and results as plain text, kept short
     for mail apps with a link length limit: the formula stays on the page.
     The visitor's own mail app opens and the visitor chooses the recipient; the page sends nothing. */
  var DISCLAIMER = "Beta. Indicative figures for information only, based on your inputs and public references.";

  function fieldLines(scope, lines) {
    scope.querySelectorAll(".sx-field").forEach(function (field) {
      var label = field.querySelector("label");
      var control = field.querySelector("input, select");
      if (!label || !control) {
        return;
      }
      var value;
      if (control.id === "cb-goods") {
        /* the CN code alone keeps the email link short */
        value = control.value === "" ? control.options[0].textContent.trim() : control.value;
      } else if (control.tagName === "SELECT") {
        value = control.options[control.selectedIndex].textContent.trim();
      } else if (control.disabled || control.readOnly) {
        value = control.placeholder;
      } else {
        value = control.value.trim() === "" ? "not entered" : control.value.trim();
      }
      lines.push(label.textContent.trim() + ": " + value);
    });
    scope.querySelectorAll(".sx-tool-results dl > div").forEach(function (row) {
      lines.push(row.querySelector("dt").textContent.trim() + ": " + row.querySelector("dd").textContent.trim());
    });
  }

  function emailBody(section, title) {
    var lines = [title];
    var parts = section.querySelectorAll(".sx-tool-part");
    if (parts.length) {
      parts.forEach(function (part) {
        lines.push("", part.querySelector(".sx-tool-part-title").textContent.trim());
        fieldLines(part, lines);
      });
    } else {
      lines.push("");
      fieldLines(section, lines);
    }
    section.querySelectorAll(".sx-tool-table").forEach(function (table) {
      lines.push("", table.querySelector("caption").textContent.trim());
      table.querySelectorAll("tr").forEach(function (row) {
        var cells = [];
        row.querySelectorAll("th, td").forEach(function (cell) {
          cells.push(cell.textContent.trim());
        });
        lines.push(cells.join(" | "));
      });
    });
    lines.push("", DISCLAIMER, window.location.origin + window.location.pathname);
    return lines.join("\r\n");
  }

  function setEmail(link, section, subject) {
    link.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(emailBody(section, subject));
  }

  var emailLink = document.getElementById("cb-email");
  var emailSection = document.getElementById("cbam-calculator");
  var EMAIL_SUBJECT = "Solvura-X CBAM cost estimate";

  function update() {
    var input = {};
    var valid = true;
    Object.keys(fields).forEach(function (name) {
      var rule = fields[name];
      var field = document.getElementById("cb-" + name);
      var error = document.getElementById("cb-" + name + "-error");
      var result = readNumber(field, rule.min, rule.max, rule.optional);
      if (result.error) {
        valid = false;
        field.setAttribute("aria-invalid", "true");
        error.textContent = result.error;
      } else {
        field.removeAttribute("aria-invalid");
        error.textContent = "";
        input[name] = result.value;
      }
    });
    input.year = Number(document.getElementById("cb-year").value);
    var sector = SECTORS[sectorSelect.value];
    if (valid && sector && !sector.freeAllocation) {
      input.benchmark = 0;
    }

    var ids = ["cb-out-emissions", "cb-out-adjustment", "cb-out-deduction", "cb-out-certificates", "cb-out-cost", "cb-out-per-tonne"];
    if (!valid) {
      ids.forEach(function (id) {
        show(id, "Check the inputs", true);
      });
      YEARS.forEach(function (year) {
        rows[year].forEach(function (cell) {
          cell.textContent = "";
        });
      });
      return;
    }

    var result = compute(input);
    var needPrice = "Add the certificate price";
    show("cb-out-emissions", format(result.emissions) + " tCO2e");
    show("cb-out-adjustment", format(result.adjustment) + " tCO2e");
    if (result.deduction === null) {
      show("cb-out-deduction", needPrice, true);
      show("cb-out-certificates", needPrice, true);
    } else {
      show("cb-out-deduction", format(result.deductionApplied) + " tCO2e");
      show("cb-out-certificates", format(result.certificates) + " tCO2e");
    }
    if (result.cost === null) {
      show("cb-out-cost", "Add a price to see a cost", true);
      show("cb-out-per-tonne", "Add a price to see a cost", true);
    } else {
      show("cb-out-cost", "EUR " + format(result.cost));
      show("cb-out-per-tonne", result.perTonne === null ? "Enter a volume above 0" : "EUR " + format(result.perTonne), result.perTonne === null);
    }

    YEARS.forEach(function (year) {
      var each = compute({
        tonnes: input.tonnes, intensity: input.intensity, benchmark: input.benchmark,
        year: year, paid: input.paid, price: input.price
      });
      var share = each.certificates === null || each.emissions === 0 ? null : each.certificates / each.emissions * 100;
      rows[year][0].textContent = share === null ? "" : formatShare(share) + " %";
      rows[year][1].textContent = each.certificates === null ? "" : format(each.certificates);
      rows[year][2].textContent = each.cost === null ? "" : format(each.cost);
    });
  }

  /* typing waits for a short pause before the live result region changes, so a screen reader reads it once;
     a select applies at once */
  var timer = null;
  form.addEventListener("input", function (event) {
    if (event.target.tagName === "SELECT") {
      return;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(update, 400);
  });
  /* a value that came from a good picked in another sector is cleared: its unit or scope may differ */
  sectorSelect.addEventListener("change", function () {
    var hadGood = goodsSelect.value !== "";
    applySector();
    fillGoods();
    if (hadGood && goodsSelect.value === "") {
      intensityField.value = "";
    }
    applyGood();
    update();
  });
  goodsSelect.addEventListener("change", function () {
    if (goodsSelect.getAttribute("aria-disabled") === "true") {
      goodsSelect.value = "";
    }
    applySector();
    applyGood();
    update();
  });
  /* a value typed by hand replaces the default value */
  intensityField.addEventListener("input", function () {
    if (goodsSelect.value !== "") {
      goodsSelect.value = "";
      applySector();
      applyGood();
    }
  });
  document.getElementById("cb-year").addEventListener("change", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    update();
  });
  applySector();
  fillGoods();
  applyGood();
  update();

  /* the link always carries the figures on screen: refreshed on hover, focus and click */
  function refreshEmail() {
    update();
    setEmail(emailLink, emailSection, EMAIL_SUBJECT);
  }
  ["mouseenter", "focus", "click"].forEach(function (name) {
    emailLink.addEventListener(name, refreshEmail);
  });
  setEmail(emailLink, emailSection, EMAIL_SUBJECT);
}());
