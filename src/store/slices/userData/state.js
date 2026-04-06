export const INITIAL_STATE = (set, get, store) => ({
  access_token: null,

  setAccessToken: access_token => set({ access_token }),

  getAccessToken: () => get().access_token,

  reset: () => {
    console.log(store.getInitialState(), "initial_state")
    set(store.getInitialState())
  },
})
