import React from 'react'
import ReactRouter from './router/ReactRouter'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <ReactRouter/>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
