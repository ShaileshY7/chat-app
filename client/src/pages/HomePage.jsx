import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import RightSidebar from '../components/RightSidebar'
import ChatContainer from '../components/ChatContainer'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
    
  const {selectedUser}=useContext(ChatContext);
  
  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[10%]'>
       <div className={`backdrop-blur-xl border-2 border-gray-800  rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative
       ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] x1:grid-cols-[1fr_2fr_1fr]':'md:grid-cols-2'}
       `}>
         <Sidebar />
         <ChatContainer />
         <RightSidebar />
        </div>
      
    </div>
  )
}

export default HomePage
