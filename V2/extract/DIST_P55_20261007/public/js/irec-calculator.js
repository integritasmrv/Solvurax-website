(function () {
  "use strict";

  /* I-REC calculator: one I-REC = one MWh of renewable electricity; a year = 8,760 hours (365 x 24).
     plant: MWh per year = MW x capacity factor x 8,760; I-RECs per year = whole MWh; total = per year x years;
     value = total x price, shown only when a price is entered.
     user: I-RECs needed per year = yearly MWh x share to cover, rounded up.
     Optional capacity factor preset by energy source: IRENA global weighted average capacity factor of new plants
     in 2021, Renewable Power Generation Costs in 2021, Table H.1.
     Every other number comes from the visitor's inputs. No network call, text only, no markup injected. */

  var HOURS_PER_YEAR = 8760;

  /* IRENA (2022), Renewable Power Generation Costs in 2021, Table H.1, capacity factor 2021, percent */
  var CAPACITY_FACTOR = {
    "solar-pv": 17,
    "onshore-wind": 39,
    "offshore-wind": 39,
    "hydropower": 45,
    "bioenergy": 68,
    "geothermal": 77,
    "csp": 80
  };

  /* clears binary floating-point noise, for example 17519.999999999996, before rounding to whole certificates */
  function clean(number) {
    return Math.round(number * 1e6) / 1e6;
  }

  function computePlant(input) {
    var mwh = clean(input.capacity * (input.factor / 100) * HOURS_PER_YEAR);
    var certs = Math.floor(mwh);
    var total = clean(certs * input.years);
    var value = input.price === null ? null : total * input.price;
    return { mwh: mwh, certs: certs, total: total, value: value };
  }

  function computeUse(input) {
    return { need: Math.ceil(clean(input.use * (input.share / 100))) };
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

  var api = { computePlant: computePlant, computeUse: computeUse, HOURS_PER_YEAR: HOURS_PER_YEAR, CAPACITY_FACTOR: CAPACITY_FACTOR };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof document === "undefined") {
    return;
  }

  var plantForm = document.getElementById("ir-producer-form");
  var useForm = document.getElementById("ir-buyer-form");
  if (!plantForm || !useForm) {
    return;
  }

  function format(number) {
    var digits = Math.abs(number) < 10 ? 2 : 0;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(number);
  }

  /* generation keeps one decimal, so it never reads higher than the whole megawatt hours that earn I-RECs */
  function formatMwh(number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Math.floor(number * 10) / 10);
  }

  /* validates a set of fields, marks each one, returns the numbers or null when any field is wrong */
  function readAll(fields) {
    var input = {};
    var valid = true;
    Object.keys(fields).forEach(function (name) {
      var rule = fields[name];
      var field = document.getElementById("ir-" + name);
      var error = document.getElementById("ir-" + name + "-error");
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
    return valid ? input : null;
  }

  var plantFields = {
    capacity: { min: 0, max: null, optional: false },
    factor: { min: 0, max: 100, optional: false },
    years: { min: 0, max: null, optional: false },
    price: { min: 0, max: null, optional: true }
  };
  var useFields = {
    use: { min: 0, max: null, optional: false },
    share: { min: 0, max: 100, optional: false }
  };

  /* a message, not a number, is set in the body face */
  function show(id, text, isMessage) {
    var cell = document.getElementById(id);
    cell.textContent = text;
    cell.classList.toggle("is-prompt", Boolean(isMessage));
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

  var emailLink = document.getElementById("ir-email");
  var emailSection = document.getElementById("irec-calculator");
  var EMAIL_SUBJECT = "Solvura-X I-REC estimate";

  function updatePlant() {
    var input = readAll(plantFields);
    if (!input) {
      ["ir-out-mwh", "ir-out-certs", "ir-out-total", "ir-out-value"].forEach(function (id) {
        show(id, "Check the inputs", true);
      });
      return;
    }
    var result = computePlant(input);
    show("ir-out-mwh", formatMwh(result.mwh) + " MWh");
    show("ir-out-certs", format(result.certs));
    show("ir-out-total", format(result.total));
    if (result.value === null) {
      show("ir-out-value", "Add a price to see a value", true);
    } else {
      show("ir-out-value", "USD " + format(result.value));
    }
  }

  function updateUse() {
    var input = readAll(useFields);
    if (input) {
      show("ir-out-need", format(computeUse(input).need));
    } else {
      show("ir-out-need", "Check the inputs", true);
    }
  }

  var sourceSelect = document.getElementById("ir-source");
  var sourceHint = document.getElementById("ir-source-hint");
  var factorField = document.getElementById("ir-factor");
  var OWN_FACTOR_HINT = "Pick a source to fill the capacity factor with an IRENA global average.";
  var PRESET_HINT = "IRENA global average for new plants of this source in 2021.";

  function applySource() {
    var factor = CAPACITY_FACTOR[sourceSelect.value];
    if (factor !== undefined) {
      factorField.value = String(factor);
      sourceHint.textContent = PRESET_HINT;
    } else {
      sourceHint.textContent = OWN_FACTOR_HINT;
    }
  }

  sourceSelect.addEventListener("change", function () {
    applySource();
    updatePlant();
  });
  /* a factor typed by hand replaces the preset */
  factorField.addEventListener("input", function () {
    if (sourceSelect.value !== "") {
      sourceSelect.value = "";
      sourceHint.textContent = OWN_FACTOR_HINT;
    }
  });

  /* typing waits for a short pause before the live result region changes, so a screen reader reads it once */
  [[plantForm, updatePlant], [useForm, updateUse]].forEach(function (pair) {
    var timer = null;
    pair[0].addEventListener("input", function (event) {
      if (event.target.tagName === "SELECT") {
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(pair[1], 400);
    });
    pair[0].addEventListener("submit", function (event) {
      event.preventDefault();
      pair[1]();
    });
  });
  applySource();
  updatePlant();
  updateUse();

  /* the link always carries the figures on screen: refreshed on hover, focus and click */
  function refreshEmail() {
    updatePlant();
    updateUse();
    setEmail(emailLink, emailSection, EMAIL_SUBJECT);
  }
  ["mouseenter", "focus", "click"].forEach(function (name) {
    emailLink.addEventListener(name, refreshEmail);
  });
  setEmail(emailLink, emailSection, EMAIL_SUBJECT);
}());
