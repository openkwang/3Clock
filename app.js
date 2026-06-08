const COUNTRIES = [
  { id: "kr", name: "한국", nameEn: "Korea", timezone: "Asia/Seoul" },
  { id: "us-ny", name: "미국 (뉴욕)", nameEn: "USA (New York)", timezone: "America/New_York" },
  { id: "us-la", name: "미국 (로스앤젤레스)", nameEn: "USA (Los Angeles)", timezone: "America/Los_Angeles" },
  { id: "us-chi", name: "미국 (시카고)", nameEn: "USA (Chicago)", timezone: "America/Chicago" },
  { id: "gb", name: "영국", nameEn: "United Kingdom", timezone: "Europe/London" },
  { id: "jp", name: "일본", nameEn: "Japan", timezone: "Asia/Tokyo" },
  { id: "cn", name: "중국", nameEn: "China", timezone: "Asia/Shanghai" },
  { id: "au-syd", name: "호주 (시드니)", nameEn: "Australia (Sydney)", timezone: "Australia/Sydney" },
  { id: "de", name: "독일", nameEn: "Germany", timezone: "Europe/Berlin" },
  { id: "fr", name: "프랑스", nameEn: "France", timezone: "Europe/Paris" },
  { id: "it", name: "이탈리아", nameEn: "Italy", timezone: "Europe/Rome" },
  { id: "es", name: "스페인", nameEn: "Spain", timezone: "Europe/Madrid" },
  { id: "ca-tor", name: "캐나다 (토론토)", nameEn: "Canada (Toronto)", timezone: "America/Toronto" },
  { id: "ca-van", name: "캐나다 (밴쿠버)", nameEn: "Canada (Vancouver)", timezone: "America/Vancouver" },
  { id: "in", name: "인도", nameEn: "India", timezone: "Asia/Kolkata" },
  { id: "sg", name: "싱가포르", nameEn: "Singapore", timezone: "Asia/Singapore" },
  { id: "th", name: "태국", nameEn: "Thailand", timezone: "Asia/Bangkok" },
  { id: "vn", name: "베트남", nameEn: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { id: "ae", name: "아랍에미리트", nameEn: "UAE", timezone: "Asia/Dubai" },
  { id: "br", name: "브라질 (상파울루)", nameEn: "Brazil (São Paulo)", timezone: "America/Sao_Paulo" },
  { id: "mx", name: "멕시코", nameEn: "Mexico", timezone: "America/Mexico_City" },
  { id: "nz", name: "뉴질랜드", nameEn: "New Zealand", timezone: "Pacific/Auckland" },
  { id: "ru-msk", name: "러시아 (모스크바)", nameEn: "Russia (Moscow)", timezone: "Europe/Moscow" },
  { id: "za", name: "남아프리카", nameEn: "South Africa", timezone: "Africa/Johannesburg" },
  { id: "eg", name: "이집트", nameEn: "Egypt", timezone: "Africa/Cairo" },
];

const DEFAULT_CLOCKS = ["kr", "us-ny", "gb"];

const clocksEl = document.getElementById("clocks");
const dialog = document.getElementById("countryDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogClose = document.getElementById("dialogClose");
const countrySearch = document.getElementById("countrySearch");
const countryList = document.getElementById("countryList");

let activeClockIndex = null;
let clockCountryIds = loadClocks();

const clockPartsCache = new Map();

function loadClocks() {
  try {
    const saved = JSON.parse(localStorage.getItem("world-clocks") || "null");
    if (Array.isArray(saved) && saved.length === 3 && saved.every((id) => findCountry(id))) {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_CLOCKS];
}

function saveClocks() {
  localStorage.setItem("world-clocks", JSON.stringify(clockCountryIds));
}

function findCountry(id) {
  return COUNTRIES.find((country) => country.id === id);
}

function getClockParts(timezone) {
  const key = `${timezone}:${Date.now() / 1000 | 0}`;
  if (!clockPartsCache.has(key)) {
    clockPartsCache.clear();
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(now);

    const hour = parts.find((p) => p.type === "hour")?.value ?? "12";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    const second = now.getSeconds();
    const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value ?? "";
    const dateLabel = new Intl.DateTimeFormat("ko-KR", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
    }).format(now);

    clockPartsCache.set(key, { hour, minute, second, dayPeriod, dateLabel });
  }
  return clockPartsCache.get(key);
}

function formatTimezoneLabel(timezone) {
  try {
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;
    return offset ?? timezone;
  } catch {
    return timezone;
  }
}

function alarmIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9v3.59L3.29 14.3a1 1 0 0 0-.08 1.32 1 1 0 0 0 1.32.08L6.7 14H17.3l2.17 1.7a1 1 0 0 0 1.32-.08 1 1 0 0 0-.08-1.32L19 12.59V9c0-3.87-3.13-7-7-7zm0 18a3 3 0 0 0 2.83-2H9.17A3 3 0 0 0 12 20z"/>
    </svg>
  `;
}

function renderClocks() {
  clocksEl.innerHTML = clockCountryIds
    .map((countryId, index) => {
      const country = findCountry(countryId);
      return `
        <article class="clock" data-index="${index}">
          <div class="clock-frame">
            <div class="clock-screen">
              <div class="screen-top">
                <span class="country-label">${country.name}</span>
                <span class="alarm-icon">${alarmIconSvg()}</span>
              </div>
              <p class="date-display" data-date="${index}">0000. 0. 0.</p>
              <div class="time-row">
                <span class="time-display">
                  <span data-hour="${index}">00</span>
                  <span class="time-separator" data-separator="${index}">:</span>
                  <span data-minute="${index}">00</span>
                </span>
                <span class="ampm" data-ampm="${index}">AM</span>
              </div>
              <p class="timezone-hint" data-zone="${index}">${formatTimezoneLabel(country.timezone)}</p>
            </div>
            <button
              type="button"
              class="clock-knob"
              data-knob="${index}"
              aria-label="${country.name} 나라 변경"
            ></button>
          </div>
        </article>
      `;
    })
    .join("");

  clocksEl.querySelectorAll(".clock-knob").forEach((knob) => {
    knob.addEventListener("click", () => openCountryDialog(Number(knob.dataset.knob)));
  });
}

function updateTimes() {
  clockPartsCache.clear();

  clockCountryIds.forEach((countryId, index) => {
    const country = findCountry(countryId);
    const { hour, minute, second, dayPeriod, dateLabel } = getClockParts(country.timezone);

    const hourEl = document.querySelector(`[data-hour="${index}"]`);
    const minuteEl = document.querySelector(`[data-minute="${index}"]`);
    const separatorEl = document.querySelector(`[data-separator="${index}"]`);
    const ampmEl = document.querySelector(`[data-ampm="${index}"]`);
    const dateEl = document.querySelector(`[data-date="${index}"]`);
    const zoneEl = document.querySelector(`[data-zone="${index}"]`);

    if (hourEl) hourEl.textContent = hour;
    if (minuteEl) minuteEl.textContent = minute;
    if (separatorEl) separatorEl.classList.toggle("is-hidden", second % 2 === 1);
    if (ampmEl) ampmEl.textContent = dayPeriod.toUpperCase();
    if (dateEl) dateEl.textContent = dateLabel;
    if (zoneEl) zoneEl.textContent = formatTimezoneLabel(country.timezone);
  });
}

function renderCountryList(filter = "") {
  const query = filter.trim().toLowerCase();
  const selectedId = activeClockIndex !== null ? clockCountryIds[activeClockIndex] : null;

  const filtered = COUNTRIES.filter((country) => {
    if (!query) return true;
    return (
      country.name.toLowerCase().includes(query) ||
      country.nameEn.toLowerCase().includes(query) ||
      country.timezone.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    countryList.innerHTML = `<li class="country-list-empty">검색 결과가 없습니다</li>`;
    return;
  }

  countryList.innerHTML = filtered
    .map(
      (country) => `
        <li>
          <button
            type="button"
            class="country-option${country.id === selectedId ? " is-selected" : ""}"
            data-country-id="${country.id}"
          >
            <span class="country-option-name">${country.name}</span>
            <span class="country-option-zone">${country.nameEn} · ${formatTimezoneLabel(country.timezone)}</span>
          </button>
        </li>
      `
    )
    .join("");

  countryList.querySelectorAll(".country-option").forEach((button) => {
    button.addEventListener("click", () => selectCountry(button.dataset.countryId));
  });
}

function openCountryDialog(clockIndex) {
  activeClockIndex = clockIndex;
  const country = findCountry(clockCountryIds[clockIndex]);
  dialogTitle.textContent = `${country.name} → 나라 변경`;
  countrySearch.value = "";
  renderCountryList();
  dialog.showModal();
  countrySearch.focus();
}

function selectCountry(countryId) {
  if (activeClockIndex === null || !findCountry(countryId)) return;

  clockCountryIds[activeClockIndex] = countryId;
  saveClocks();
  dialog.close();
  activeClockIndex = null;
  renderClocks();
  updateTimes();
}

dialogClose.addEventListener("click", () => dialog.close());
countrySearch.addEventListener("input", (event) => renderCountryList(event.target.value));

dialog.addEventListener("close", () => {
  activeClockIndex = null;
  countrySearch.value = "";
});

renderClocks();
updateTimes();
setInterval(updateTimes, 1000);
