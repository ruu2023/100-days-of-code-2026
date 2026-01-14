import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import PasswordManager from './components/PasswordManager'

function App() {

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <PasswordManager />
      </div>
    </QueryClientProvider>
  )
}

export default App
