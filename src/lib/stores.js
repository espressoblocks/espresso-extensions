import { writable } from "svelte/store";

import defaultExtensions from "./extensions.js";

export const searchQuery = writable("");
export const searchRecommendations = writable([]);
export const selectedRecommendedExt = writable("");
export const showingAddSourceModal = writable(false);

//this is for the add source thingy
export const operationInProgress = writable(false);
export const currentOperation = writable("");

//curet etensions since they can be added hnavfudnuiafd
export const extensions = writable(defaultExtensions);