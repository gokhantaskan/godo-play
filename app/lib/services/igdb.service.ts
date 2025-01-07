export type IGDBFields = {
  fields?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  where?: string;
  search?: string;
  [key: string]: any;
};

export default {
  async allGames(fields: IGDBFields) {
    const { limit = 100, sort = "aggregated_rating desc", ...rest } = fields;

    return await this.request("games", {
      fields:
        "name,category,platforms.*,genres.*,player_perspectives.*,themes.*,cover.*,game_modes.*,multiplayer_modes.*,first_release_date,release_dates.*",
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
