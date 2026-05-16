import React from 'react'
import ReactRouter from './router/ReactRouter'
import { LanguageProvider } from './context/LanguageContext'
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <div>
      <LanguageProvider>
        <UserProvider>
          <ReactRouter/>
        </UserProvider>
      </LanguageProvider>
    </div>
  )
}

export default App
