export const CORE_STORE = "SkellyStore";
export const CORE_STORE_LINK = "https://skullbite.github.io/skellystore/";

export const GITHUB = "skullbite/skellycord";
export const GITHUB_REPO = `https://github.com/${GITHUB}/`;
export const GUILD_DATA = {
    id: "1207058659037683812",
    invite: "aW3We2VKna"
};

export const MOD_STORAGE_KEY = "SkellycordInternal";
export const MOD_SETTINGS = {
    firstStart: true,
    quickcss: "",
    storeLinks: [],
    stores: {},
    webThemes: ""
};

// @ts-expect-error Defined by build tool
export const MOD_VERSION: string = __MOD_VERSION;
// @ts-expect-error Defined by build tool
export const RELEASE_STATE: string = __RELEASE_STATE;
// @ts-expect-error Defined by build tool
export const LAST_COMMIT: string = __GH_SHA;