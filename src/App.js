import React, { useEffect, useReducer } from 'react'
import { createTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import logo from './logo.svg'
import './App.css'
import ESCOAPI from './services/api'
import EscoOccupationsList from './components/EscoOccupationsList'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1fab66',
      contrastText: '#fff'
    },
    secondary: {
      main: '#fff',
      contrastText: '#000'
    },
    error: {
      main: '#f44336',
      contrastText: '#fff'
    }
  },
  typography: {
    h4: {
      color: '#1fab66'
    }
  }
})

const useStyles = makeStyles(theme => ({
  app: {
    width: 600,
    margin: '0 auto',
    padding: 40
  }
}))
export default function App () {
  const classes = useStyles()
  const initialState = {
    occupations: [],
    selectedOccupations: []
  }
  const reducer = (state, newState) => ({ ...state, ...newState })
  const [state, setState] = useReducer(reducer, initialState)
  const currentLang = 'fi'

  useEffect(() => {
    /* Get ESCO occupations */
    ESCOAPI().getTopLevelConcepts(currentLang).then(data => {
      const arr = data || [] // In case data is undefined, set empty array
      setState({ occupations: arr })
      return data
    })
  }, []) // On component mount

  const fetchOccupationChildren = (uri) => {
    return ESCOAPI().getChildOccupations(uri, currentLang).then(data => data)
  }

  const isOccupationSelected = (occup) => state.selectedOccupations.find(selected => selected.code === occup.code) != null

  const handleOccupationCheck = (occupation) => {
    if (isOccupationSelected(occupation)) {
      /* Remove selected occupations from component state */
      const occupationsWithoutUncheckedOccupation = state.selectedOccupations.filter(selected => selected.code !== occupation.code)
      setState({ selectedOccupations: occupationsWithoutUncheckedOccupation })
    } else {
      /* Set selected occupation to state */
      const occupationsWithNewlyChecked = [...state.selectedOccupations, occupation]
      setState({ selectedOccupations: occupationsWithNewlyChecked })
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.app}>
        <Typography variant='h4'>ESCO lista</Typography>
        <EscoOccupationsList
          occupations={state.occupations}
          maxParentLevel={2}
          selectable
          fetchOccupationChildren={fetchOccupationChildren}
          onOccupationCheck={handleOccupationCheck}
          selectedOccupations={state.selectedOccupations}
          badges
        />
      </div>
    </ThemeProvider>
  )
}
