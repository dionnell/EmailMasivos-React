import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppRouter } from "./app.router"
import { Toaster } from 'sileo'

const queryClient = new QueryClient() 


export const EmailMasivosApp = () => {


  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position='top-center' />
    </QueryClientProvider>

  )
}
