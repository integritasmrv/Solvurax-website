(function () {
  "use strict";

  /* carbon credit calculator: credits per year = area x rate; after the buffer = that x (1 - buffer share);
     total = after the buffer x years; value = total x price, shown only when a price is entered.
     Optional rate preset: an IPCC 2019 default above-ground biomass growth for an African climate zone and forest type,
     tonnes of dry matter per hectare per year, x carbon fraction 0.47 x 44/12 = tCO2e per hectare per year.
     No network call, text only, no markup injected. */

  var CARBON_FRACTION = 0.47;
  var CO2_PER_CARBON = 44 / 12;

  /* IPCC 2019 Refinement, Volume 4, Chapter 4, Africa rows. Natural regrowth = Table 4.9, secondary forest up to 20 years
     and over 20 years; plantations = Table 4.10 by species and age. Values in tonnes of dry matter per hectare per year. */
  var GROWTH = {
    "tropical-rainforest": [
      ["natural-young", "Natural regrowth, first 20 years", 7.6],
      ["natural-older", "Natural regrowth, after 20 years", 3.5],
      ["pine-young", "Pine plantation, first 20 years", 20],
      ["other-young", "Other species plantation, first 20 years", 6]
    ],
    "tropical-moist-deciduous": [
      ["natural-young", "Natural regrowth, first 20 years", 2.9],
      ["natural-older", "Natural regrowth, after 20 years", 0.9],
      ["eucalyptus-young", "Eucalyptus plantation, first 20 years", 20],
      ["eucalyptus-older", "Eucalyptus plantation, after 20 years", 25],
      ["other-young", "Other species plantation, first 20 years", 9]
    ],
    "tropical-dry": [
      ["natural-young", "Natural regrowth, first 20 years", 3.9],
      ["natural-older", "Natural regrowth, after 20 years", 1.6],
      ["eucalyptus-young", "Eucalyptus plantation, first 20 years", 13],
      ["pine-young", "Pine plantation, first 20 years", 6],
      ["pine-older", "Pine plantation, after 20 years", 9],
      ["other-young", "Other species plantation, first 20 years", 10]
    ],
    "tropical-shrubland": [
      ["natural-older", "Natural regrowth, after 20 years", 0.9],
      ["eucalyptus-young", "Eucalyptus plantation, first 20 years", 5],
      ["eucalyptus-older", "Eucalyptus plantation, after 20 years", 8],
      ["pine-young", "Pine plantation, first 20 years", 3],
      ["pine-older", "Pine plantation, after 20 years", 2.5],
      ["other-young", "Other species plantation, first 20 years", 15],
      ["other-older", "Other species plantation, after 20 years", 10]
    ],
    "tropical-mountain": [
      ["natural-young", "Natural regrowth, first 20 years", 5.5],
      ["natural-older", "Natural regrowth, after 20 years", 1.8],
      ["plantation", "Plantation, all species", 10]
    ],
    "subtropical-humid": [
      ["natural-young", "Natural regrowth, first 20 years", 2.5],
      ["natural-older", "Natural regrowth, after 20 years", 1.0]
    ],
    "subtropical-dry": [
      ["natural-young", "Natural regrowth, first 20 years", 2.4],
      ["natural-older", "Natural regrowth, after 20 years", 1.8],
      ["eucalyptus-young", "Eucalyptus plantation, first 20 years", 13],
      ["pine-young", "Pine plantation, first 20 years", 8],
      ["pine-older", "Pine plantation, after 20 years", 10],
      ["other-young", "Other species plantation, first 20 years", 10]
    ],
    "subtropical-steppe": [
      ["natural-young", "Natural regrowth, first 20 years", 1.2],
      ["natural-older", "Natural regrowth, after 20 years", 0.9],
      ["eucalyptus-young", "Eucalyptus plantation, first 20 years", 5],
      ["eucalyptus-older", "Eucalyptus plantation, after 20 years", 8],
      ["pine-young", "Pine plantation, first 20 years", 3],
      ["pine-older", "Pine plantation, after 20 years", 2.5],
      ["other-young", "Other species plantation, first 20 years", 15],
      ["other-older", "Other species plantation, after 20 years", 10]
    ],
    "subtropical-mountain": [
      ["natural-young", "Natural regrowth, first 20 years", 2.5],
      ["natural-older", "Natural regrowth, after 20 years", 0.5],
      ["plantation", "Plantation, all species", 10]
    ]
  };

  /* clears binary floating-point noise before display rounding */
  function clean(number) {
    return Math.round(number * 1e6) / 1e6;
  }

  /* tonnes of dry matter per hectare per year to tCO2e per hectare per year, 2 decimals */
  function presetRate(dryMatter) {
    return Math.round(dryMatter * CARBON_FRACTION * CO2_PER_CARBON * 100) / 100;
  }

  function findType(zone, key) {
    var list = GROWTH[zone] || [];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i][0] === key) {
        return list[i];
      }
    }
    return null;
  }

  function compute(input) {
    var gross = clean(input.area * input.rate);
    var net = clean(gross * (1 - input.buffer / 100));
    var total = clean(net * input.years);
    var value = input.price === null ? null : clean(total * input.price);
    return { gross: gross, net: net, total: total, value: value };
  }

  /* reads one field: empty = null, otherwise a finite number inside [min, max] or an error message */
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

  var api = { compute: compute, presetRate: presetRate, findType: findType, GROWTH: GROWTH };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof document === "undefined") {
    return;
  }

  var form = document.getElementById("cc-form");
  if (!form) {
    return;
  }

  var fields = {
    area: { min: 0, max: null, optional: false },
    rate: { min: 0, max: null, optional: false },
    years: { min: 0, max: null, optional: false },
    buffer: { min: 0, max: 100, optional: false },
    price: { min: 0, max: null, optional: true }
  };
  var out = {
    gross: document.getElementById("cc-out-gross"),
    net: document.getElementById("cc-out-net"),
    total: document.getElementById("cc-out-total"),
    value: document.getElementById("cc-out-value")
  };
  var zoneSelect = document.getElementById("cc-zone");
  var typeSelect = document.getElementById("cc-type");
  var typeHint = document.getElementById("cc-type-hint");
  var rateField = document.getElementById("cc-rate");
  var OWN_RATE_HINT = "Pick a zone and a forest type to fill the rate with an IPCC default.";
  var PRESET_HINT = "IPCC 2019 default above-ground growth for this forest type in Africa, in tCO2e: a gross rate, before the deductions of the project's methodology.";

  function format(number) {
    var digits = Math.abs(number) < 10 ? 2 : 0;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(number);
  }

  /* a message, not a number, is set in the body face */
  function show(cell, text, isMessage) {
    cell.textContent = text;
    cell.classList.toggle("is-prompt", isMessage);
  }

  /* fills the forest type list for the chosen zone; keeps the same type when the new zone has it */
  function fillTypes() {
    var keep = typeSelect.value;
    while (typeSelect.options.length > 1) {
      typeSelect.remove(1);
    }
    (GROWTH[zoneSelect.value] || []).forEach(function (row) {
      var option = document.createElement("option");
      option.value = row[0];
      option.textContent = row[1];
      typeSelect.appendChild(option);
    });
    typeSelect.value = findType(zoneSelect.value, keep) ? keep : "";
  }

  function applyType() {
    var row = findType(zoneSelect.value, typeSelect.value);
    if (row) {
      rateField.value = String(presetRate(row[2]));
      typeHint.textContent = PRESET_HINT;
    } else {
      typeHint.textContent = OWN_RATE_HINT;
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
      if (control.tagName === "SELECT") {
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

  var emailLink = document.getElementById("cc-email");
  var emailSection = document.getElementById("carbon-calculator");
  var EMAIL_SUBJECT = "Solvura-X carbon credit estimate";

  function update() {
    var input = {};
    var valid = true;
    Object.keys(fields).forEach(function (name) {
      var rule = fields[name];
      var field = document.getElementById("cc-" + name);
      var error = document.getElementById("cc-" + name + "-error");
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

    if (!valid) {
      Object.keys(out).forEach(function (key) {
        show(out[key], "Check the inputs", true);
      });
      return;
    }

    var result = compute(input);
    show(out.gross, format(result.gross) + " tCO2e", false);
    show(out.net, format(result.net) + " tCO2e", false);
    show(out.total, format(result.total) + " tCO2e", false);
    if (result.value === null) {
      show(out.value, "Add a price to see a value", true);
    } else {
      show(out.value, "USD " + format(result.value), false);
    }
  }

  /* typing waits for a short pause before the live result region changes, so a screen reader reads it once */
  var timer = null;
  function updateSoon() {
    window.clearTimeout(timer);
    timer = window.setTimeout(update, 400);
  }

  zoneSelect.addEventListener("change", function () {
    fillTypes();
    applyType();
    update();
  });
  typeSelect.addEventListener("change", function () {
    applyType();
    update();
  });
  /* a rate typed by hand replaces the preset */
  rateField.addEventListener("input", function () {
    if (typeSelect.value !== "") {
      typeSelect.value = "";
      typeHint.textContent = OWN_RATE_HINT;
    }
  });
  form.addEventListener("input", function (event) {
    if (event.target.tagName !== "SELECT") {
      updateSoon();
    }
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    update();
  });
  fillTypes();
  applyType();
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
