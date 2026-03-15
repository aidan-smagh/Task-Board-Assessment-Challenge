import { useState } from 'react'
import './App.css'
import Task from "./components/Task"

function App() {

  return (
    <>
      <Task task={{title: "example", description: "another example"}}/>
    </>
  )
}

export default App
