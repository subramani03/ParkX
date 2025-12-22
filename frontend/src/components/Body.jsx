import React, { useContext, useEffect } from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

const Body = () => {

    //   const { formData } = useContext(FormContext);
    return (
        <div >
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    )
}

export default Body