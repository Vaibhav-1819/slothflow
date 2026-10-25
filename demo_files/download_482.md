# Frontend State Management Architecture

We evaluated Zustand, Redux Toolkit, and React Context for client-side state.
Decision: Use lightweight Zustand stores for global UI state and React Query for server-state caching.

Component hierarchy guidelines:
- Container components handle hooks and data fetching
- Presentational components remain pure and render props
- CSS utility classes structured via Tailwind