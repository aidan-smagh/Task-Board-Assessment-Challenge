import './App.css';
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {

  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        supabase.auth.signInAnonymously().then(() => setReady(true))
      } else {
        setReady(true)
      }
    })
  }, [])

useEffect(() => {
  const initAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      await supabase.auth.signInAnonymously()
    }

    setReady(true)
  }
  initAuth()
}, [])
  if (!ready) return <div>Loading...</div>

  return <Home />
}

export default App
