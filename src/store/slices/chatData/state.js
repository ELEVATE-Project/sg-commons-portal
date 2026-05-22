export const INITIAL_STATE = (set, get, store) => ({
  llmError: "",
  sessionId: null,
  stateMachineLength: 0,
  strandStep: null,

  getStrandStep: () => get().strandStep,
  setStrandStep: strandStep => set({ strandStep }),

  setSessionId: sessionId => set({ sessionId }),
  getSessionId: () => get().sessionId,

  setStateMachineLength: stateMachineLength => set({ stateMachineLength }),
  getStateMachineLength: () => get().stateMachineLength,

  reset: () => {
    set(store.getInitialState())
  },
})
