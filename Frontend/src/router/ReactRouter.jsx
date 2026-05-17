import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from '../page/Home';
import UserDashboard from '../page/UserDashboard';
import History from '../page/History';
import Login from '../page/Login';
import Signup from '../page/Signup';
import Logout from '../page/Logout';
import ChatBot from '../page/ChatBot';
import Test from '../page/Test';
import KidsPetBuddy from '../page/KidsPetBuddy';
import DoctorDashboard from '../page/DoctorDashboard';
import Profile from '../page/Profile';
import GuardianMonitor from '../page/GuardianMonitor';
import ReportDetail from '../page/ReportDetail';
import NutriFinder from '../page/NutriFinder';
import ProtectedRoute from '../auth/ProtectedRoute';
import GuestRoute from '../auth/GuestRoute';

function ReactRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<GuestRoute><Login/></GuestRoute>}/>
        <Route path='/signup' element={<GuestRoute><Signup/></GuestRoute>}/>
        <Route path='/logout' element={<Logout/>}/>

        <Route path='/dashboard' element={
          <ProtectedRoute role="patient">
            <UserDashboard/>
          </ProtectedRoute>
        }/>
        <Route path='/doctor-dashboard' element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard/>
          </ProtectedRoute>
        }/>
        <Route path='/profile' element={
          <ProtectedRoute role="patient">
            <Profile/>
          </ProtectedRoute>
        }/>
        <Route path='/history' element={
          <ProtectedRoute role="patient">
            <History/>
          </ProtectedRoute>
        }/>
        <Route path='/history/:id' element={
          <ProtectedRoute role="patient">
            <ReportDetail/>
          </ProtectedRoute>
        }/>
        <Route path='/chatbot' element={
          <ProtectedRoute role="patient">
            <ChatBot/>
          </ProtectedRoute>
        }/>
        <Route path='/kidbuddy' element={
          <ProtectedRoute role="patient">
            <KidsPetBuddy/>
          </ProtectedRoute>
        }/>
        <Route path='/test' element={
          <ProtectedRoute role="patient">
            <Test/>
          </ProtectedRoute>
        }/>
        <Route path='/guardian' element={
          <ProtectedRoute role="patient">
            <GuardianMonitor/>
          </ProtectedRoute>
        }/>
        <Route path='/nutrifinder' element={
          <ProtectedRoute role="patient">
            <NutriFinder/>
          </ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  )
}

export default ReactRouter
