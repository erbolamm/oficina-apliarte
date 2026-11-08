// Reusable component: Voice/Narration selector and configuration block.
// Shared across Shorts, Voice Studio, and Locución modules.
// Registers on window.OficinaComponentes.narracionControl. DOM is built with createElement only.
(function (root) {
  "use strict";

  var ns = (root.OficinaComponentes = root.OficinaComponentes || {});

  var DEFAULT_SPEAKERS = [
    { id: "vivian", label: "Vivian" },
    { id: "serena", label: "Serena" },
    { id: "uncle_fu", label: "Uncle Fu" },
    { id: "ryan", label: "Ryan" },
    { id: "aiden", label: "Aiden" },
    { id: "ono_anna", label: "Ono Anna" },
    { id: "sohee", label: "Sohee" },
    { id: "eric", label: "Eric" },
    { id: "dylan", label: "Dylan" }
  ];

  var DEFAULT_MODES = [
    { id: "estudio", label: "Voz de estudio" },
    { id: "clonacion", label: "Voz de Javier (clonada)" }
  ];

  var DEFAULT_LANGS = [
    { id: "es", label: "Español" },
    { id: "en", label: "Inglés" },
    { id: "fr", label: "Francés" },
    { id: "de", label: "Alemán" },
    { id: "it", label: "Italiano" },
    { id: "pt", label: "Portugués" }
  ];

  function buildSelect(id, options, selectedValue, onChange) {
    var select = document.createElement("select");
    select.id = id;
    options.forEach(function (opt) {
      var option = document.createElement("option");
      option.value = opt.id;
      option.textContent = opt.label;
      if (opt.id === selectedValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    if (typeof onChange === "function") {
      select.addEventListener("change", function () {
        onChange(select.value);
      });
    }
    return select;
  }

  function appendField(parent, labelText, childNode) {
    var label = document.createElement("label");
    label.className = "cz-narracion__field";
    label.textContent = labelText;
    label.appendChild(childNode);
    parent.appendChild(label);
    return label;
  }

  // props: {
  //   textId?: string,
  //   speakerId?: string,
  //   modeId?: string,
  //   langId?: string,
  //   initialText?: string,
  //   initialSpeaker?: string,
  //   initialMode?: string,
  //   initialLang?: string,
  //   onTextChange?: function(text),
  //   onSpeakerChange?: function(speaker),
  //   onModeChange?: function(mode),
  //   onLangChange?: function(lang)
  // }
  function render(container, props) {
    props = props || {};
    var box = document.createElement("div");
    box.className = "cz-narracion-control";

    var textField = document.createElement("textarea");
    textField.id = props.textId || "voice-text";
    textField.rows = 2;
    textField.maxLength = 500;
    textField.autocomplete = "off";
    textField.placeholder = "Vacío: sin voz";
    textField.value = props.initialText || "";
    if (typeof props.onTextChange === "function") {
      textField.addEventListener("input", function () {
        props.onTextChange(textField.value);
      });
    }
    appendField(box, "Narración en voz (con VoiceStudio; sustituye a la música)", textField);

    var row = document.createElement("div");
    row.className = "cz-narracion__row";

    var speakerSelect = buildSelect(
      props.speakerId || "voice-speaker",
      DEFAULT_SPEAKERS,
      props.initialSpeaker || "vivian",
      props.onSpeakerChange
    );
    appendField(row, "Voz", speakerSelect);

    var modeSelect = buildSelect(
      props.modeId || "voice-mode",
      DEFAULT_MODES,
      props.initialMode || "estudio",
      props.onModeChange
    );
    appendField(row, "Modo", modeSelect);

    var langSelect = buildSelect(
      props.langId || "voice-lang",
      DEFAULT_LANGS,
      props.initialLang || "es",
      props.onLangChange
    );
    appendField(row, "Idioma", langSelect);

    box.appendChild(row);

    var note = document.createElement("p");
    note.className = "cz-narracion__note";
    note.textContent = "La voz se genera con VoiceStudio al confirmar. Si la duración sobrepasa el vídeo disponible, se avisa en el reporte de validación.";
    box.appendChild(note);

    if (container) container.appendChild(box);
    return box;
  }

  ns.narracionControl = { render: render };
})(typeof window !== "undefined" ? window : globalThis);
