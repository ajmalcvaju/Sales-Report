import React from 'react'
import Header from '../components/Header'

const About = () => {
  return (
    <>
    <Header/>
    <div className='px-4 py-12 max-w-2xl mx-auto'>
      <h1 className='text-3xl font-bold  mb-4 text-slate-800'>About</h1>
      <p className='mb-4 text-slate-700'>
       Welcome To About page.
      </p>
    </div>
    </>
  )
}

export default About