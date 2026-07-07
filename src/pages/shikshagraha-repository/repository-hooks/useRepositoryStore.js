// repository-store.js
import { create } from "zustand";
import {
  listMedia,
  getMediaById,
  searchSimilarMedia,
  getMasterList,
} from "./../repository-api/index";

/**
 * Zustand store for Media Repository
 * Manages media list, single media detail, filters, pagination, loading states.
 */
// Internal debounce/coalesce state for fetchMediaList
let _fetchTimer = null;
let _pendingFetchParams = null;
let _requestInFlight = false;
let _inFlightPromise = null;
const _inFlightQueryMap = {};
const _recentQueryCache = {};
const _inFlightDetailMap = {};

const DEFAULT_PAGINATION = {
  limit: 6,
  offset: 0,
};
const DEFAULT_SORT_BY = "-created_at";

export const useRepositoryStore = create((set, get) => ({
  // State
  mediaList: [],
  mediaCount: 0,
  mediaNext: null,
  mediaPrevious: null,
  selectedMedia: null,
  masterList: null,
  loadingList: false,
  loadingDetail: false,
  loadingMaster: false,
  filters: {}, // current filters object (media_type, priority, tag, etc.)
  q: "",
  searchInput: "", // current value in search textarea (not submitted yet)
  pagination: DEFAULT_PAGINATION,
  sortBy: DEFAULT_SORT_BY,
  repositoryScrollY: 0,

  // Actions
  /**
   * Fetch media list with current filters, pagination, sorting
   * @param {Object} params - Optional override parameters
   */
  // Debounced / coalescing fetch to avoid duplicate rapid requests
  fetchMediaList: (params = {}, immediate = false) => {
    // merge params into pending
    _pendingFetchParams = { ...( _pendingFetchParams || {} ), ...params };

    const runFetch = async () => {
      if (_requestInFlight) {
        // return existing in-flight promise to dedupe callers
        return _inFlightPromise || Promise.resolve();
      }
      _requestInFlight = true;
      set({ loadingList: true });
      _inFlightPromise = (async () => {
        try {
          const { filters, pagination, sortBy, q } = get();
          const transformedFilters = get().getTransformedFilters(filters);
          const queryParams = {
            searchInput: q || null,
            ...transformedFilters,
            ...pagination,
            ordering: sortBy,
            ...(_pendingFetchParams || {}),
          };
          // clear pending before request so new calls accumulate after this
          _pendingFetchParams = null;
          const key = JSON.stringify(queryParams);
          // If an identical request is already in flight, reuse it
          if (_inFlightQueryMap[key]) {
            try { return await _inFlightQueryMap[key]; } catch (e) { throw e; }
          }

          
          // If we recently completed an identical query, reuse its result for a short window
          try {
            const cached = _recentQueryCache[key];
            if (cached && (Date.now() - cached.ts) < 500) {
              // apply cached response to state if needed
              const data = cached.data;
              const prevCount = get().mediaCount;
              const prevList = get().mediaList || [];
              const prevIds = prevList.map((m) => m?.id).join(",");
              const newIds = (data.results || []).map((m) => m?.id).join(",");
              if (!(prevCount === data.count && prevIds === newIds)) {
                set({
                  mediaList: data.results,
                  mediaCount: data.count,
                  mediaNext: data.next,
                  mediaPrevious: data.previous,
                });
              }
              return data;
            }
          } catch (e) {}

          // store the in-flight promise for this query key
          _inFlightQueryMap[key] = (async () => {
            let data;
            try {
              data = await listMedia(queryParams);
              const prevCount = get().mediaCount;
              const prevList = get().mediaList || [];
              const prevIds = prevList.map((m) => m?.id).join(",");
              const newIds = (data.results || []).map((m) => m?.id).join(",");
              if (prevCount === data.count && prevIds === newIds) {
                
              } else {
                set({
                  mediaList: data.results,
                  mediaCount: data.count,
                  mediaNext: data.next,
                  mediaPrevious: data.previous,
                });
                
              }
              return data;
            } catch (err) {
              throw err;
            } finally {
              try {
                if (typeof data !== "undefined") {
                  _recentQueryCache[key] = { ts: Date.now(), data };
                }
                delete _inFlightQueryMap[key];
              } catch (e) {}
            }
          })();

          const data = await _inFlightQueryMap[key];
          return data;
        } catch (error) {
          // Ignore cancellation errors caused by aborting previous requests
          const isCanceled = error && (error.code === "ERR_CANCELED" || error.name === "CanceledError" || (error.message && error.message.toLowerCase().includes("canceled")));
          if (isCanceled) {
            
          } else {
            console.error("Error fetching media list:", error);
          }
          throw error;
        } finally {
          _requestInFlight = false;
          set({ loadingList: false });
          // if new params arrived while we were fetching, schedule another run
          if (_pendingFetchParams) {
            // schedule next tick to avoid recursion
            clearTimeout(_fetchTimer);
            _fetchTimer = setTimeout(runFetch, 50);
          }
        }
      })();
      return _inFlightPromise;
    };
    clearTimeout(_fetchTimer);
    if (immediate) {
      const p = runFetch();
      // return promise so callers can await completion
      return p;
    } else {
      _fetchTimer = setTimeout(runFetch, 150);
      // return a promise that resolves when the next run completes
      return new Promise((resolve) => {
        const id = setTimeout(async () => {
          await runFetch();
          resolve();
          clearTimeout(id);
        }, 160);
      });
    }
  },

  /**
   * Fetch single media details by ID
   * @param {number|string} id - Media ID
   */
  fetchMediaDetail: async (id) => {
    if (!id) return;
    // return existing in-flight promise for this id if present
    if (_inFlightDetailMap[id]) return _inFlightDetailMap[id];

    const current = get();
    if (current.selectedMedia && String(current.selectedMedia.id) === String(id)) {
      return Promise.resolve(current.selectedMedia);
    }

    // create and store in-flight promise
    _inFlightDetailMap[id] = (async () => {
      set({ loadingDetail: true });
      try {
        const media = await getMediaById(id);
        set({ selectedMedia: media });
        return media;
      } catch (error) {
        console.error("Error fetching media detail:", error);
        throw error;
      } finally {
        set({ loadingDetail: false });
        try { delete _inFlightDetailMap[id]; } catch (e) {}
      }
    })();
    return _inFlightDetailMap[id];
  },

  /**
   * Search media via similarity search API
   * @param {Object} params - Similarity search params (q, limit, etc.)
   */
  searchMediaSimilar: async (params = {}) => {
    set({ loadingList: true });
    try {
      const { filters, pagination, sortBy } = get();
      const queryParams = {
        ...filters,
        ...pagination,
        ordering: sortBy,
        ...params,
      };
      const data = await searchSimilarMedia(queryParams);
      set({
        mediaList: data.results,
        mediaCount: data.count,
        mediaNext: data.next,
        mediaPrevious: data.previous,
      });
    } catch (error) {
      console.error("Error searching similar media:", error);
    } finally {
      set({ loadingList: false });
    }
  },

  /**
   * Fetch master list data for filters
   */
  fetchMasterList: async () => {
    set({ loadingMaster: true });
    try {
      const master = await getMasterList();

      const dropdown_meta = [
        {
          key: "organizations",
          label: "Organization",
          options: master?.organizations?.map((x) => ({ value: x?.slug, display: x?.name })),
        },
        {
          key: "tags",
          label: "Themes",
          options: master?.tags?.map((x) => ({
            value: x?.name,
            display: x?.name,
          })),
        },
        {
          key: "resource_types",
          label: "Resource Type",
          options: master?.resource_types?.map((x) => ({
            value: x?.value,
            display: x?.display,
          })),
        },
        {
          key: "media_types",
          label: "File Type",
          options: master?.media_types?.map((x) => ({
            value: x?.value,
            display: x?.display,
          })),
        },
      ];

      set({ masterList: dropdown_meta });
    } catch (error) {
      console.error("Error fetching master list:", error);
    } finally {
      set({ loadingMaster: false });
    }
  },

  /**
   * Update filters and optionally reset pagination
   * @param {Object} newFilters - Filter updates to merge
   * @param {boolean} resetPagination - Whether to reset offset to 0 (default true)
   */
  // newFilters: object to merge
  // resetPagination: boolean
  // options: { skipFetch: boolean }
  setFilters: (newFilters, resetPagination = true, options = {}) => {
    const current = get().filters || {};
    const merged = { ...current, ...newFilters };

    // Remove empty or cleared keys from merged so removals are treated as changes
    Object.keys(merged).forEach((k) => {
      const v = merged[k];
      if (Array.isArray(v) && v.length === 0) {
        delete merged[k];
      } else if (v == null) {
        delete merged[k];
      } else if (typeof v === "string" && v.trim() === "") {
        delete merged[k];
      }
    });

    // Canonicalize filters for stable equality checks: arrays -> sorted comma list,
    // strings that look like comma-lists are normalized, objects try to extract .value
    const canonicalize = (f) => {
      const out = {};
      Object.entries(f || {}).forEach(([k, v]) => {
        try {
          if (Array.isArray(v)) {
            const vals = v
              .map((x) => (typeof x === "string" ? x : (x && x.value != null ? String(x.value) : String(x))))
              .filter(Boolean)
              .map((s) => String(s).trim())
              .sort();
            out[k] = vals.join(",");
          } else if (typeof v === "string") {
            const vals = v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .sort();
            out[k] = vals.join(",");
          } else if (v && typeof v === "object") {
            if (v.value != null) out[k] = String(v.value);
            else out[k] = JSON.stringify(v);
          } else if (v == null) {
            // skip
          } else {
            out[k] = String(v);
          }
        } catch (e) {
          out[k] = String(v);
        }
      });
      return out;
    };

    const nCurr = canonicalize(current);
    const nMerged = canonicalize(merged);
    if (JSON.stringify(nCurr) === JSON.stringify(nMerged)) {
    
      return;
    }

    set((state) => ({
      filters: merged,
      pagination: resetPagination
        ? { ...state.pagination, offset: 0 }
        : state.pagination,
    }));
    
    if (!options.skipFetch) {
      get().fetchMediaList();
    }
  },
  /**
   * Reset filters to empty object
   */
  resetFilters: (options = {}) => {
    
    const current = get().filters || {};
    const noFilters = Object.keys(current).length === 0 || Object.values(current).every((v) => (Array.isArray(v) ? v.length === 0 : !v));
    if (noFilters) {
      
      return;
    }
    set((state) => ({ filters: {}, pagination: { ...state.pagination, offset: 0 } }));
    if (!options.skipFetch) get().fetchMediaList();
  },
  forceResetFilters: (options = {}) => {
    
    set((state) => ({ filters: {}, pagination: { ...state.pagination, offset: 0 } }));
    if (!options.skipFetch) get().fetchMediaList();
  },

  replaceRepositoryQueryState: (nextState = {}, options = {}) => {
    const nextPagination = {
      ...DEFAULT_PAGINATION,
      ...(nextState.pagination || {}),
    };

    set({
      filters: nextState.filters || {},
      q: nextState.q || "",
      searchInput:
        nextState.searchInput != null ? nextState.searchInput : nextState.q || "",
      pagination: nextPagination,
      sortBy: nextState.sortBy || DEFAULT_SORT_BY,
      repositoryScrollY: nextState.repositoryScrollY || 0,
    });

    if (!options.skipFetch) {
      return get().fetchMediaList({}, true);
    }

    return Promise.resolve();
  },

  getRepositoryQuerySnapshot: () => {
    const { filters, q, searchInput, pagination, sortBy, repositoryScrollY } = get();

    return {
      filters,
      q,
      searchInput,
      pagination,
      sortBy,
      repositoryScrollY,
    };
  },

  setRepositoryScrollY: (scrollY = 0) => {
    set({ repositoryScrollY: Number(scrollY) || 0 });
  },

  /**
   * Update search input value (textarea value, not submitted yet)
   * @param {string} newSearchInput - Current textarea value
   */
  setSearchInput: (newSearchInput) => {
    set({ searchInput: newSearchInput });
  },
  /**
   * Update filters and optionally reset pagination
   * @param {Object} newFilters - Filter updates to merge
   * @param {boolean} resetPagination - Whether to reset offset to 0 (default true)
   */
  setSearch: (newSearch, resetPagination = true) => {
    set((state) => ({
      ...state,
      q: newSearch,
      searchInput: newSearch, // sync searchInput with submitted search
      pagination: resetPagination
        ? { ...state.pagination, offset: 0 }
        : state.pagination,
    }));
    get().fetchMediaList();
  },
  /**
   * Set pagination parameters
   * @param {Object} newPagination - e.g. { offset: 20, limit: 10 }
   */
  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
    get().fetchMediaList();
  },
  /**
   * Set sort order string
   * @param {string} newSortBy - e.g. '-created_at'
   */
  setSortBy: (newSortBy) => {
    set({ sortBy: newSortBy });
    get().fetchMediaList();
  },
  getTransformedFilters: (filters) => {
    const transformedFilters = Object.entries(filters || {}).reduce((acc, [key, value]) => {
      try {
        if (Array.isArray(value)) {
          // value may be array of strings or objects like { value, label }
          acc[key] = value
            .map((x) => (typeof x === "string" ? x : (x && x.value != null ? String(x.value) : String(x))))
            .filter(Boolean)
            .join(",");
        } else if (value && typeof value === "string") {
          acc[key] = value;
        } else if (value && typeof value === "object") {
          // single object: try to extract .value or stringify
          acc[key] = value.value != null ? String(value.value) : JSON.stringify(value);
        } else if (value == null) {
          // skip
        } else {
          acc[key] = String(value);
        }
      } catch (e) {
        // fallback to string conversion
        acc[key] = String(value);
      }
      return acc;
    }, {});
    return transformedFilters;
  },
}));
