import React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  spinner: {
    display: 'flex',
    padding: '16px 16px'
  },
  centered: {
    width: '100%',
    justifyContent: 'center'
  }
}))

export default function Spinner (props) {
  const classes = useStyles()

  if (props.centered) {
    return (
      <div className={classNames(classes.spinner, classes.centered)}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className={classes.spinner}>
      <CircularProgress />
    </div>
  )
}

