export type IGDBFields = {
  fields?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  where?: string;
  [key: string]: any;
};

export default {
  async allGames(options: IGDBFields) {
    const {
      fields = "name,slug,category,platforms.*,genres.*,player_perspectives.*,themes.*,cover.*,game_modes.*,multiplayer_modes.*,first_release_date",
      limit = 100,
      sort = "aggregated_rating desc",
      where = "category=(0,3,8,9) & version_parent=null & platforms=() & age_ratings.category=(2) & release_dates.date>=1672531200",
      ...rest
    } = options;

    return await this.request("games", {
      fields,
      limit,
      sort,
      where,
      ...rest,
    });
  },

  async searchGames(query: string, options: Partial<IGDBFields> = {}) {
    const strictWhere = "game_modes != 1";

    const {
      fields = "name,slug,category,platforms.*,genres.*,player_perspectives.*,themes.*,cover.*,game_modes.*,multiplayer_modes.*,aggregated_rating",
      limit = 100,
      // category=(0,3,8,9) & version_parent=null
      where,
      sort = "popularity desc",
      ...rest
    } = options;

    return await this.request("games", {
      fields,
      where: `name~*"${query}"* & ${strictWhere}`.concat(
        where ? ` & ${where}` : ""
      ),
      limit,
      sort,
      ...rest,
    });
  },

  async gameModes() {
    return await this.request("game_modes", {
      fields: "name,slug",
    });
  },

  async platforms() {
    return await this.request("platforms", {
      fields: "name,slug",
      limit: 250,
    });
  },

  async genres() {
    return await this.request("genres", {
      fields: "name,slug",
      limit: 250,
    });
  },

  async themes() {
    return await this.request("themes", {
      fields: "name,slug",
      limit: 250,
    });
  },

  async request<T = any>(endpoint: string, body: IGDBFields) {
    try {
      const response = await fetch(`/api/igdb/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw createError({
          statusCode: response.status,
          statusMessage: response.statusText,
        });
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error("Error fetching data from IGDB:", error);
      throw error;
    }
  },
};
