export interface NextIdProfile {
    address:     string;
    identity:    string;
    platform:    string;
    displayName: string;
    avatar:      string;
    email:       null;
    description: null | string;
    location?:   null;
    header:      null | string;
    links:       Links;
}

export interface Links {
    website?:   LinkAndHandle;
    farcaster?: LinkAndHandle;
    lenster?:   LinkAndHandle;
}

export interface LinkAndHandle {
    link:   string;
    handle: string;
}