import { colorLinesFlag } from "./flags"

export const MALE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5c94ed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mars"><path d="M16 3h5v5"/><path d="m21 3-6.75 6.75"/><circle cx="10" cy="14" r="6"/></svg>'
export const FEMALE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f062b9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venus"><path d="M12 15v7"/><path d="M9 19h6"/><circle cx="12" cy="9" r="6"/></svg>'
export const INTERSEX_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fed905" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venus-and-mars"><path d="M10 20h4"/><path d="M12 16v6"/><path d="M17 2h4v4"/><path d="m21 2-5.46 5.46"/><circle cx="12" cy="11" r="5"/></svg>'
export const NON_BINARY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-non-binary"><path d="M12 2v10"/><path d="m9 4 6 4"/><path d="m9 8 6-4"/><circle cx="12" cy="17" r="5"/></svg>'
export const TRANSGENDER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-transgender"><path d="M12 16v6"/><path d="M14 20h-4"/><path d="M18 2h4v4"/><path d="m2 2 7.17 7.17"/><path d="M2 5.355V2h3.357"/><path d="m22 2-7.17 7.17"/><path d="M8 5 5 8"/><circle cx="12" cy="12" r="4"/></svg>'

export const TRANSGENDER_FLAG_ICON = colorLinesFlag(["#64c7f3", "#f4a8ba", "#fff", "#f4a8ba", "#64c7f3"]);

export const NON_BINARY_FLAG_ICON = colorLinesFlag(["#ffed00", "#fff", "#7f5ca3", "#000"]);

export const AGENDER_FLAG_ICON = colorLinesFlag(["#000", "#A3A3A3", "#fff", "#C5F391", "#fff", "#A3A3A3", "#000"]);