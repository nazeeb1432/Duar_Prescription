import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

    const {aToken ,doctors,getAllDoctors}=useContext(AdminContext)

    useEffect(()=>{
        if(aToken){
            getAllDoctors()
        }
    },[aToken])
  return (
    <div>
      DoctorList
    </div>
  )
}

export default DoctorsList
