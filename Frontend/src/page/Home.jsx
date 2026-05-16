import React from 'react'
import Navbar from '../components/Navbar'
import Landing from '../components/Landing'
import AboutUs from '../components/About'
import HowItWorks from '../components/HowToWork'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className='h-full w-full'>
        <Navbar/>
        <Landing/>
        <AboutUs/>
        <HowItWorks/>
        <Footer/>
    </div>
  )
}

export default Home