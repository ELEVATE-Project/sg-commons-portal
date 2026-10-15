import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRoutes } from "react-router-dom"
import MainPage from "pages/ai-creation/pages/shikshalokam-mitra/MainPage"
import ImprovementPlan from "pages/ai-creation/pages/improvement-plan"
import ResourceListingPage from "pages/shikshagraha-repository/listing"
import ResourceDetailPage from "pages/shikshagraha-repository/details"
import NotFound from "pages/shikshagraha-repository/not-found"
import ROUTES from "./url"
import ResourceHomePage from "pages/shikshagraha-repository/home"

const queryClient = new QueryClient()

function App() {
  const elements = useRoutes([
    { path: ROUTES.MITRA_CHAT, element: <MainPage /> },
    { path: ROUTES.IMPROVEMENT_PLAN, element: <ImprovementPlan /> },
    { path: ROUTES.SHIKSHAGRAHA_REPOSITORY, element: <ResourceHomePage /> },
    { path: ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST, element: <ResourceListingPage /> },
    { path: ROUTES.SHIKSHAGRAHA_REPOSITORY_DETAIL, element: <ResourceDetailPage /> },
    { path: ROUTES.NOT_FOUND, element: <NotFound /> },
  ])

  return (
    <QueryClientProvider client={queryClient}>
      {elements}
    </QueryClientProvider>
  )
}

export default App