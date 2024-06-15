export type Playlist = {
  collaborative: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: {
    height: number;
    url: string;
    width: number;
  }[];
  name: string;
  owner: Owner;
  primary_color: null;
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
};

export type PlaylistResponse = {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: Playlist[];
};
export type Owner = {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  type: string;
  uri: string;
};

export type PlaylistDetailed = {
  collaborative: boolean;
  description: string;
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  images: { height: number | null; url: string; width: number | null }[];
  name: string;
  owner: Owner;
  primary_color: null;
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    items: PlaylistTrack[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  type: string;
  uri: string;
};

export type PlaylistTrack = {
  added_at: string;
  added_by: {
    external_urls: { spotify: string };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  primary_color: null;
  track: {
    preview_url: string;
    available_markets: string[];
    explicit: boolean;
    type: string;
    episode: boolean;
    track: boolean;
    album: {
      available_markets: string[];
      type: string;
      album_type: string;
      href: string;
      id: string;
      images: { height: number | null; url: string; width: number | null }[];
      name: string;
      release_date: string;
      release_date_precision: string;
      uri: string;
      artists: {
        external_urls: { spotify: string };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
      }[];
      external_urls: { spotify: string };
      total_tracks: number;
    };
    artists: {
      external_urls: { spotify: string };
      href: string;
      id: string;
      name: string;
      type: string;
      uri: string;
    }[];
    disc_number: number;
    track_number: number;
    duration_ms: number;
    external_ids: { isrc: string };
    external_urls: { spotify: string };
    href: string;
    id: string;
    name: string;
    popularity: number;
    uri: string;
    is_local: boolean;
  };
  video_thumbnail: { url: null };
};
