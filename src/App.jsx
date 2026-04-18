import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase.from('notes').select('*')
      if (error) {
        setError(error.message)
      } else {
        setNotes(data)
      }
      setLoading(false)
    }

    fetchNotes()
  }, [])

  if (loading) return <p>Loading notes...</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Notes</h1>
      {notes.length === 0 ? (
        <p>No notes found. Add some rows to your Supabase "notes" table.</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>{note.content ?? JSON.stringify(note)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
